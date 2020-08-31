'use strict';


const apiKey = "1d62dcc4ccmsh8f65dfaa7cbec9XXXXX7p1a038cjsnc4b64aed5049";
const searchUrl = "https://trackingmore.p.rapidapi.com/packages/track";

/*
https://trackingmore.p.rapidapi.com/packages/track?trackingNumber=YT2003521266065328&carrierCode=yunexpress

*/


/************************************************************************************************************************* */


function formatQueryString(params) {
    console.log('running formatQueryString')
    const queryParts = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryParts.join('&');
}

function clearList() {
    $('#package-list').empty();
}


function displayResults(responseJson) {
    console.log(responseJson);
    $('#package-list').append(
        `<li>
            <h3>${responseJson.data.items[0].tracking_number}</h3>
            <p>${(responseJson.data.items[0].status).toUpperCase()} - ${responseJson.data.items[0].origin_info.trackinfo[0].Date}</p>
            <p>${responseJson.data.items[0].origin_info.trackinfo[0].StatusDescription}</p>
            </li>`
    );
    $('#packages').removeClass('hidden');
};


function getPackageInfo(newTrackingNum, carrier) {
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
        .then(responseJson => displayResults(responseJson))
        .catch(err => alert('Whoops! Something is not correctly inputteded.'));
    console.log('request sent');
};






/************************* Listener **********************************************/


function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const newTrackingNum = $('#js-number-input').val();
        const carrier = $('#js-carrier-input').val();
        console.log('input received')
        getPackageInfo(newTrackingNum, carrier);

    })
};




$(watchForm);