/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

var videoElement = document.querySelector('video');
var audioInputSelect = document.querySelector('select#audioSource');
var audioOutputSelect = document.querySelector('select#audioOutput');
var videoSelect = document.querySelector('select#videoSource');
var selectors = [audioInputSelect, audioOutputSelect, videoSelect];
const photoFilter = document.getElementById('photo-filter');
let filter = 'none';
let url = '';

// audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

// var button = document.querySelector('button#snap');
let state = 1;
// button.onclick = function () {
//     if (state) {
//         video.pause();
//         button.innerHTML = "Retake snapshot";
//         state = 0;
//         createCanvas();
//     } else {
//         video.play();
//         button.innerHTML = "Take snapshot";
//         state = 1;
//     }
// };

var upload = document.querySelector('button#upload');
// upload.onclick = function () {
//     var storageRef = firebase.storage().ref('images/' + (new Date().getTime()));

//     // Upload file
//     var task = storageRef.putString(url, 'data_url');
//     task.on('state_changed',
//         function progress(snapshot) {
//         },
//         function error(err) {
//             console.log(err);
//         },
//         function complete() {
//             console.log(task.snapshot.downloadURL);
//             writeNewImage('iliyamlokman@gmail.com', task.snapshot.downloadURL, document.getElementById('desc').value);
//         });
// };

function writeNewImage(email, url, desc) {
    // A post entry.
    var postData = {
      email,
      url,
      desc
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('images').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/images/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
  }

function createCanvas() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').filter = filter;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    url = canvas.toDataURL("image/png");
    document.getElementById('url').innerHTML = "<a href='" + url + "' target='_blank'>Click</a>";
}

// photoFilter.addEventListener('change', function (e) {
//     // Set filter to chosen option
//     filter = e.target.value;
//     video.style.filter = filter;
//     createCanvas();
//     e.preventDefault();
// });

function gotDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    var values = selectors.map(function (select) {
        return select.value;
    });
    selectors.forEach(function (select) {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
    });
    for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        var option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label ||
                'microphone ' + (audioInputSelect.length + 1);
            audioInputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'audiooutput') {
            option.text = deviceInfo.label || 'speaker ' +
                (audioOutputSelect.length + 1);
            audioOutputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
            videoSelect.appendChild(option);
        } else {
            console.log('Some other kind of source/device: ', deviceInfo);
        }
    }
    selectors.forEach(function (select, selectorIndex) {
        if (Array.prototype.slice.call(select.childNodes).some(function (n) {
            return n.value === values[selectorIndex];
        })) {
            select.value = values[selectorIndex];
        }
    });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
        element.setSinkId(sinkId)
            .then(function () {
                console.log('Success, audio output device attached: ' + sinkId);
            })
            .catch(function (error) {
                var errorMessage = error;
                if (error.name === 'SecurityError') {
                    errorMessage = 'You need to use HTTPS for selecting audio output ' +
                        'device: ' + error;
                }
                console.error(errorMessage);
                // Jump back to first output device in the list as it's the default.
                audioOutputSelect.selectedIndex = 0;
            });
    } else {
        console.warn('Browser does not support output device selection.');
    }
}

function changeAudioDestination() {
    var audioDestination = audioOutputSelect.value;
    attachSinkId(videoElement, audioDestination);
}

function gotStream(stream) {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
    // Refresh button list in case labels have become available
    return navigator.mediaDevices.enumerateDevices();
}

function start() {
    if (window.stream) {
        window.stream.getTracks().forEach(function (track) {
            track.stop();
        });
    }
    //var audioSource = audioInputSelect.value;
    var videoSource = null;
    var constraints = {
        audio: false,
        video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    };
    navigator.mediaDevices.getUserMedia(constraints).
        then(gotStream).then(gotDevices).catch(handleError);
}

// audioInputSelect.onchange = start;
// audioOutputSelect.onchange = changeAudioDestination;
// videoSelect.onchange = start;

start();

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}