import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { Spinner } from 'spin.js';
import moment from 'moment';

const firebaseConfig = {
  apiKey: "AIzaSyDEOzKoxLxyiUhQoNBAJXGlxBTaDs_kxO8",
  authDomain: "cactoots-544c1.firebaseapp.com",
  databaseURL: "https://cactoots-544c1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cactoots-544c1",
  storageBucket: "cactoots-544c1.appspot.com",
  messagingSenderId: "829920313384",
  appId: "1:829920313384:web:a755fa3e1459c663f6751d"
};

const app = initializeApp(firebaseConfig);
const database = getFirestore();
const dateformat = 'MM/DD/YYYY hh:mm:ss';
const PESO = value => currency(value, { symbol: '₱', precision: 1, decimal: '.', separator: ',' });

var opts = {
  lines: 14, // The number of lines to draw
  length: 33, // The length of each line
  width: 19, // The line thickness
  radius: 71, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 1.2, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-shrink', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#ffffff', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  zIndex: 2000000000, // The z-index (defaults to 2e9)
  className: 'spinner', // The CSS class to assign to the spinner
  position: 'absolute', // Element positioning
};

const loading = new Spinner(opts);

function toggleLoading(loadingText, loadingTarget, show){
    if(show){
      $(loadingTarget).addClass('show');
        $(loadingTarget).text(loadingText);
        loading.spin(loadingTarget);
    }
    else{
        loading.stop();
        $(loadingTarget).removeClass('show');
    }
}

function appendLoadingDOM(){
    var styles = `
        #loadingOverlay{
          position: fixed;
            width: 100%;
            height: 100%;
          background: rgba(0,0,0,0.5);
          visibility: hidden;
        }
        
        .show{
          visibility: visible;
        }
    `

    var styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    if(document.getElementById('loadingOverlay') != null){
      return;
    }
    var $div = $('<div />').appendTo('body');
    $div.attr('id', 'loadingOverlay');
}

function firebaseTimeStampToDateString(timestamp){
  let date = timestamp.toDate();
  let m = moment(date);
  return m.format(dateformat);
}

appendLoadingDOM();

window.onbeforeunload = function (e) {
    e = e || window.event;

    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Sure?';
    }

    // For Safari
    return 'Sure?';
};

export { app, database, toggleLoading, dateformat, PESO, firebaseTimeStampToDateString };
