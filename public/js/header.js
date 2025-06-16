songBtn = document.getElementById('songs-btn')
appBtn = document.getElementById('apps-btn')
newsBtn = document.getElementById('news-btn')
homeBtn = document.querySelector('#home-btn')
jazzJamsBtn = document.querySelector('#jazz-jams-btn')
playerBtn = document.querySelector('#player-btn')
treasureBtn = document.querySelector('#treasure-btn')
serverBtn = document.querySelector('#server-btn')
shortsBtn = document.querySelector('#shorts-btn')

// const myIP = 'http://127.0.0.1:4000'
// const myIP = 'http://67.8.168.66'
// const myIP = 'http://192.168.1.2:4000'
// const myIP = 'https://www.theshape.org'
const myIP = 'http://72.211.154.251:4000'

homeBtn.addEventListener('click', function() {
    window.location.href = '/';
})
songBtn.addEventListener('click', function() {
    window.location.href = 'songs'
})
appBtn.addEventListener('click', function() {
    window.location.href = 'apps'
})
newsBtn.addEventListener('click', function() {
    window.location.href = 'news'
})
jazzJamsBtn.addEventListener('click', function() {
    window.location.href = 'jazz'
})
playerBtn.addEventListener('click', function() {
    window.location.href = 'player'
})
treasureBtn.addEventListener('click', function() {
    window.location.href = 'map'
})
serverBtn.addEventListener('click', () => {
    window.location.href = 'server'
})
shortsBtn.addEventListener('click', () => {
    window.location.href = 'shorts'
})
//HTTP POST request to the Node.js API
function postReq(dataToSend, api) {
    return fetch(`${myIP}${api}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
    })
    .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json()
    })
    .then(data => {
    //console.log('Response from the API:', data);
    return data;
    })
    .catch(error => {
    console.error('Error sending object to API:', error);
    });
}

function postNoRes(dataToSend, api) {
    fetch(`${myIP}${api}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
}

function getReq(req) {
    return fetch(`${myIP}${req}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    //   console.log(response.json)
      return response.json()
    }).then((data) => {
        // console.log(data)
        return data;
    }).catch(error => {
        console.error("Error loading the JSON file", error);
    })
}

function getPdf(req) {
    fetch(`${myIP}${req}`)
}