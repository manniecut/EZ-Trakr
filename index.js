/*
 TO DO
    -make entire list refreshable
    -add store cookie functionality
*/



'use strict';

const apiKey = "1d62dcc4ccmsh8f65dfaa7cbec9xxxxxx7p1a038cjsnc4b64aed5049";
const searchUrl = "https://trackingmore.p.rapidapi.com/packages/track";

const STORE = [
    {
        nickName: "Drone Parts from GetFPV",
        trackingNum: "EX-12345698",
        status: "DELIVERED",
        date: "2020-08-28 16:21",
        description: "Your fake package is in or at your doorstep"
    },
    {
        nickName: "Books from eBay",
        trackingNum: "8342704440",
        status: "TRANSIT",
        date: "2020-09-01 04:11:00",
        description: "Arrived at Sort Facility HONG KONG - HONG KONG SAR, CHINA"
    }
];



/*********************** LIST FUNCTIONS ****************************************************/

function generateItemElement(item) {              //formats the STORED items for use in the list
    console.log('generateItemElement');
    return `
    <li data-item-id="${item.trackingNum}">
      <span class="package-item js-package-item">${item.trackingNum}</span>
            <h3>${item.nickName}</h3>
            <p>${item.status} - ${item.date}</p>
            <p>${item.description}</p>
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
        description: responseJson.data.items[0].origin_info.trackinfo[0].StatusDescription
    });
}

function displayResults(responseJson, packageNickName) {   //stores response data and refreshes the displayed list
    console.log('displayResults')
    addNumToStore(responseJson, packageNickName);
    renderPackageList();
}



/************************ REQUEST FUNCTIONS *********************************************/

function formatQueryString(params) {      //
    console.log('running formatQueryString')
    const queryParts = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryParts.join('&');
}

function getPackageInfo(newTrackingNum, carrier, packageNickName) { //gets the information then runs JSON through displayReults
    console.log('running getPackageInfo');
    console.log(carrier);
    const params = {
        trackingNumber: newTrackingNum,
        carrierCode: carrier
    };
    console.log('params object set')
    const queryString = formatQueryString(params);
    const url = searchUrl + '?' + queryString;
    const options = {
        headers: new Headers({
            "x-rapidapi-host": "trackingmore.p.rapidapi.com",
            "x-rapidapi-key": apiKey
        })
    };
    fetch(url, options)
        .then(response => response.json())
        .then(responseJson => displayResults(responseJson, packageNickName))
        .catch(error => alert('Whoops! Something is not correctly inputteded.'));
    console.log('request sent');
};



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