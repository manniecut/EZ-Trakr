'use strict';

const apiKeyTracking = "c5128df5b0msh18188fd61436bc7p13b97fjsn8f4c632a3599";
const apiKeyMaps = "AIzaSyC5q4AzjnRDhf53nceGVJBJPRbBVZyDS5U"

const searchUrl = "https://order-tracking.p.rapidapi.com/trackings/realtime";


const STORE = [
    {
        nickName: "null",
        trackingNum: "null",
        status: "null",
        date: "null",
        description: "null",
        location: "null",
        carrier: "null"
    },
];



/*********************** SAVE/LOAD FUNCTIONS ****************************************************/

function loadLocalStorage() {
    console.log('function loadLocalStorage()')
    let currentLength = STORE.length;
    if (currentLength > 0) {
        console.log('parsing local storage')
        let loadedStore = JSON.parse(localStorage.getItem("storeString")); //create a variable that contains the parsed stored item
        console.log('the loaded storage is:');
        console.log(loadedStore);
        STORE.splice(0, currentLength);
        console.log('store spliced');
        for (let i = 0; i < loadedStore.length; i++) {
            STORE.push(loadedStore[i]);
            console.log('loading stored object into STORE')
        }
        console.log('loading complete')
    } else {
        console.log('nothing saved');
    };
};

function saveToLocalStorage() {
    console.log('function saveToLocalStorage()');
    let storeString = JSON.stringify(STORE);
    console.log('storeString =');
    console.log(storeString);
    localStorage.setItem("storeString", storeString);
    console.log('localStorage =')
    console.log(localStorage);
}



/*********************** LIST FUNCTIONS ****************************************************/

function generateItemElement(item) {              //formats the STORED items for use in the list
    console.log(`function generateItemElement() for ${item.nickName}`);
    let mapDisplay = getMap(item.location)
    return `
    <li data-item-id="${item.trackingNum}">
      <span class="package-item js-package-item">${item.trackingNum}/${item.carrier}</span>
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
    console.log('function generatePackageItemsString()');
    const items = trackingStore.map((item) => generateItemElement(item));
    return items.join("");
};

function renderPackageList() { // displays result of generatePackageItemsString in html area
    saveToLocalStorage(STORE);
    console.log('function renderPackageList()');
    const packageListItemsString = generatePackageItemsString(STORE);
    $('.js-package-list').html(packageListItemsString);     // this is the combined formatted HTML strings from STORE
};

function getItemIdFromElement(item) {
    console.log('function getItemIdFromElement()');
    return $(item)
        .closest('li')
        .data('item-id');
}



/********* LIST ITEM BUTTONS *********/

function deleteListItem(itemId) {
    console.log(`**DELETE**`)
    const itemIndex = STORE.findIndex(item => item.trackingNum === itemId);
    STORE.splice(itemIndex, 1);
}

function handleDeleteItem() {
    $('.js-package-list').on('click', '.js-item-delete', event => {
        const itemId = getItemIdFromElement(event.currentTarget);
        deleteListItem(itemId);
        renderPackageList();
    });
}

function refreshList() {
    console.log('**REFRESH**');
    let previousData = STORE;
    for (let i = 0; i < previousData.length; i++) {
        getPackageInfo(previousData[i].trackingNum, previousData[i].carrier, previousData[i].nickName);
    };
    STORE.splice(0, previousData.length);
};

function handleRefreshButton() {
    $('#packages').on('click', '.js-list-refresh', event => {
        refreshList();
    });

}



/********************* ADDING RESPONSE INFORMATION TO THE LIST *****************************/

function addNumToStore(responseJson, packageNickName) {     //adds information from responseJson to the STORE
    console.log(`function addNumToStore() for "${packageNickName}"`);
    STORE.push({
        nickName: packageNickName,
        trackingNum: responseJson.data.items[0].tracking_number,
        status: (responseJson.data.items[0].status).toUpperCase(),
        date: responseJson.data.items[0].origin_info.trackinfo[0].Date,
        description: responseJson.data.items[0].origin_info.trackinfo[0].StatusDescription,
        location: responseJson.data.items[0].origin_info.trackinfo[0].Details,
        carrier: responseJson.data.items[0].carrier_code
    });
}

function displayResults(responseJson, packageNickName) {   //stores response data and refreshes the displayed list
    console.log(`function displayResults() for "${packageNickName}`);
    console.log(responseJson)
    addNumToStore(responseJson, packageNickName);
    renderPackageList();
}



/************************ REQUEST FUNCTIONS *********************************************/

function getPackageInfo(newTrackingNum, carrier, packageNickName) { //gets the information then runs JSON through displayReults
    console.log(`function getPackageInfo() for ${packageNickName}`);
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
    console.log('FETCH request sent');
};

function getMap(location) {
    console.log('function getMap()');
    let locationEncoded = encodeURI(location)
    console.log(locationEncoded);
    let mapsURL = `https://www.google.com/maps/embed/v1/search?key=${apiKeyMaps}&q=${locationEncoded}`
    console.log('retrieving Map from ' + mapsURL);
    return mapsURL;

}



/************************* EVENT LISTENERS **********************************************/

function handlePackageList() {
    console.log('SCRIPT INITIATING')
    loadLocalStorage();
    renderPackageList();
    handleDeleteItem();
    handleRefreshButton();
    watchForm();
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const newTrackingNum = $('#js-number-input').val();
        const carrier = $('#js-carrier-input').val();
        const packageNickName = $('#js-nickname-input').val();
        console.log('**NEW SUBMISSION**')
        getPackageInfo(newTrackingNum, carrier, packageNickName);
    })
};



$(handlePackageList);