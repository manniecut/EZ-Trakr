'use strict';

const apiKeyTracking = "c5128df5b0msh18188fd61436bc7p13b97fjsn8f4c632a3599";
const apiKeyMaps = "AIzaSyC5q4AzjnRDhf53nceGVJBJPRbBVZyDS5U"

const searchUrl = "https://order-tracking.p.rapidapi.com/trackings/realtime";


const STORE = [];



/*********************** SAVE/LOAD FUNCTIONS ****************************************************/

function loadLocalStorage() {
    console.log('function loadLocalStorage()')
    console.log('parsing local storage')
    let loadedStore = JSON.parse(localStorage.getItem("storeString")); //create a variable that contains the parsed stored item
    console.log('the loaded storage is:');
    console.log(loadedStore);
    let currentStoreLength = STORE.length;
    if (loadedStore <= 0) {
        console.log('nothing saved');
    } else {
        STORE.splice(0, currentStoreLength);
        console.log('STORE cleared');
        for (let i = 0; i < loadedStore.length; i++) {
            STORE.push(loadedStore[i]);
            console.log('loading stored object into STORE')
        }
        console.log('loading complete')
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
};



/*********************** LIST FUNCTIONS ****************************************************/

function generateItemElement(item) {              //formats the STORED items for use in the list
    console.log(`function generateItemElement() for ${item.nickName}`);
    let mapDisplay = getMap(item.location)
    return `
    <li data-item-id="${item.trackingNum}">
      <span class="package-item js-package-item tracking-title">${item.carrier.toUpperCase()} / / ${item.trackingNum}</span>
            <h3 class="li-nickname">${item.nickName}</h3><hr>
            <div class="status-div">
            <p class="li-status item">${item.status}</p><p class="li-status item">${item.date}</p>
            </div>
            <div>
            <p class="li-description">${item.description}</p>
            <p class="li-location">${item.location}</p>
            <iframe src="${mapDisplay}"></iframe>
            </div>
        
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
};



/********* LIST ITEM BUTTONS *********/

function deleteListItem(itemId) {
    console.log(`**DELETE** - ${itemId}`)
    const itemIndex = STORE.findIndex(item => (item.trackingNum) == itemId);
    console.log(itemIndex);
    STORE.splice(itemIndex, 1);
    renderPackageList();
};

function refreshList() {
    console.log('**REFRESH**');
    let previousData = STORE;
    for (let i = 0; i < previousData.length; i++) {
        getPackageInfo(previousData[i].trackingNum, previousData[i].carrier, previousData[i].nickName);
    };
    STORE.splice(0, previousData.length);
};

function newPackageMenu() {
    document.getElementById("dropmenu").classList.toggle("show");
    console.log('menu toggle');
};



/********************* ADDING RESPONSE INFORMATION TO THE LIST *****************************/

function addNumToStore(responseJson, packageNickName) {     //adds information from responseJson to the STORE
    console.log(`function addNumToStore() for "${packageNickName}"`);
    STORE.unshift({
        nickName: packageNickName,
        trackingNum: responseJson.data.items[0].tracking_number,
        status: (responseJson.data.items[0].status).toUpperCase(),
        date: responseJson.data.items[0].origin_info.trackinfo[0].Date,
        description: responseJson.data.items[0].origin_info.trackinfo[0].StatusDescription,
        location: responseJson.data.items[0].origin_info.trackinfo[0].Details,
        carrier: responseJson.data.items[0].carrier_code
    });
};

function displayResults(responseJson, packageNickName) {   //stores response data and refreshes the displayed list
    console.log(`function displayResults() for "${packageNickName}`);
    console.log(responseJson)
    addNumToStore(responseJson, packageNickName);
    renderPackageList();
    $('#js-number-input').val('');
    $('#js-carrier-input').val('');
    $('#js-nickname-input').val('');
};



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
};



/************************* EVENT LISTENERS **********************************************/

function handlePackageList() {
    console.log('SCRIPT INITIATING')
    loadLocalStorage();
    refreshList();
    renderPackageList();
    handleNewPackageMenu();
    handleDeleteItem();
    handleRefreshButton();
    watchForm();
};

function handleDeleteItem() {
    $('.js-package-list').on('click', '.js-item-delete', event => {
        const itemId = getItemIdFromElement(event.currentTarget);
        console.log(itemId);
        deleteListItem(itemId);
    });
};

function handleRefreshButton() {
    $('#header').on('click', '.js-list-refresh', event => {
        refreshList();
    });
};

function handleNewPackageMenu() {
    $('#header').on('click', '.js-new-package-menu', event => {
        console.log('handleNewPackageMenu()')
        newPackageMenu();
    })
};

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const newTrackingNum = $('#js-number-input').val();
        const carrier = $('#js-carrier-input').val();
        const packageNickName = $('#js-nickname-input').val();
        console.log('**NEW SUBMISSION**')
        getPackageInfo(newTrackingNum, carrier, packageNickName);
        newPackageMenu();
    })
};



$(handlePackageList);