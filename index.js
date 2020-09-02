/*
 TO DO
    -make entire list refreshable
 MAYBE
    -add store cookie functionality
    -show/hide description and map
*/



'use strict';

const apiKeyTracking = "c5128df5b0msh18188fd61436bc7p13b97fjsn8f4c632a3599";
const apiKeyMaps = "AIzaSyC5q4AzjnRDhf53nceGVJBJPRbBVZyDS5U"

const searchUrl = "https://order-tracking.p.rapidapi.com/trackings/realtime";

const STORE = [
    {
        nickName: "Drone Parts from GetFPV",
        trackingNum: "EX-12345698",
        status: "DELIVERED",
        date: "2020-08-28 16:21",
        description: "Your fake package is in or at your doorstep",
        location: "ROMULUS, MI - USA"
    },
    {
        nickName: "Books from eBay",
        trackingNum: "8342704440",
        status: "TRANSIT",
        date: "2020-09-01 04:11:00",
        description: "Arrived at Sort Facility HONG KONG - HONG KONG SAR, CHINA",
        location: "HONG KONG - HONG KONG SAR, CHINA"
    }
];



/*********************** LIST FUNCTIONS ****************************************************/

function generateItemElement(item) {              //formats the STORED items for use in the list
    console.log('generateItemElement');
    let mapDisplay = getMap(item.location)
    return `
    <li data-item-id="${item.trackingNum}">
      <span class="package-item js-package-item">${item.trackingNum}</span>
            <h3>${item.nickName}</h3>
            <p>${item.status} - ${item.date}</p>
            <p>${item.description}</p>
            <p>${item.location}</p>
            <iframe src="${mapDisplay}"></iframe>
      <div class="package-item-controls">
        <button class="package-item-delete js-item-delete">
            <span class="button-label">Remove</span>
        </button>
      </div>
    </li>`
};

function generatePackageItemsString(trackingStore) { // combines html elements generated from STORE items and returns them ready to be displayed
    console.log('generatePackageItemsString');
    const items = trackingStore.map((item) => generateItemElement(item));
    return items.join("");
};

function renderPackageList() { // displays result of generatePackageItemsString in html area
    console.log('renderPackageList');
    const packageListItemsString = generatePackageItemsString(STORE);
    $('.js-package-list').html(packageListItemsString);     // this is the combined formatted HTML strings from STORE
};

function getItemIdFromElement(item) {
    console.log('getItemIdFromElement');
    return $(item)
        .closest('li')
        .data('item-id');
}



/********* REMOVE LIST ITEM BUTTON *********/

function deleteListItem(itemId) {
    console.log(`deleteListItem`)
    const itemIndex = STORE.findIndex(item => item.trackingNum === itemId);
    STORE.splice(itemIndex, 1);
}

function handleDeleteItem() {
    console.log('handleDeleteItem');
    $('.js-package-list').on('click', '.js-item-delete', event => {
        console.log('clicked remove')
        const itemId = getItemIdFromElement(event.currentTarget);
        deleteListItem(itemId);
        renderPackageList();

    });
}



/********************* ADDING RESPONSE INFORMATION TO THE LIST *****************************/

function addNumToStore(responseJson, packageNickName) {     //adds information from responseJson to the STORE
    console.log(`Adding "${packageNickName}" to package list`);
    STORE.push({
        nickName: packageNickName,
        trackingNum: responseJson.data.items[0].tracking_number,
        status: (responseJson.data.items[0].status).toUpperCase(),
        date: responseJson.data.items[0].origin_info.trackinfo[0].Date,
        description: responseJson.data.items[0].origin_info.trackinfo[0].StatusDescription,
        location: responseJson.data.items[0].origin_info.trackinfo[0].Details
    });
}

function displayResults(responseJson, packageNickName) {   //stores response data and refreshes the displayed list
    console.log('displayResults')
    console.log(responseJson)
    addNumToStore(responseJson, packageNickName);
    renderPackageList();
}



/************************ REQUEST FUNCTIONS *********************************************/


function getPackageInfo(newTrackingNum, carrier, packageNickName) { //gets the information then runs JSON through displayReults
    console.log('running getPackageInfo');
    console.log(carrier);
    var myHeaders = new Headers();
    myHeaders.append("x-rapidapi-host", " order-tracking.p.rapidapi.com");
    myHeaders.append("x-rapidapi-key", ` ${apiKeyTracking}`);
    myHeaders.append("content-type", " application/json");
    var bodyString = `{
        "tracking_number": "${newTrackingNum}",
        "carrier_code": "${carrier}"
    }`
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: bodyString,
        redirect: 'follow'
    };

    fetch(searchUrl, requestOptions)
        .then(response => response.json())
        .then(responseJson => displayResults(responseJson, packageNickName))
        .catch(error => alert('Please check that your tracking number and carrier match and try again.'));
    console.log('request sent');
};

function getMap(location) {
    console.log('getting map');
    let locationEncoded = encodeURI(location)
    console.log(locationEncoded);
    let mapsURL = `https://www.google.com/maps/embed/v1/search?key=${apiKeyMaps}&q=${locationEncoded}`    
    console.log(mapsURL);
    return mapsURL;

}




/************************* EVENT LISTENERS **********************************************/

function handlePackageList() {
    renderPackageList();
    handleDeleteItem();
    watchForm();
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const newTrackingNum = $('#js-number-input').val();
        const carrier = $('#js-carrier-input').val();
        const packageNickName = $('#js-nickname-input').val();
        console.log('input received')
        getPackageInfo(newTrackingNum, carrier, packageNickName);
    })
};



$(handlePackageList);