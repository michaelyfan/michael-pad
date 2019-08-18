import 'firebase/firestore';

import { firebase } from './config';
import '../css/global.css';
import '../css/login.css';

const USER_EMAIL = 'michaelyfan100@gmail.com';


// DOM functions

/**
 * Displays an info message to the user inside the submit button
 * @param  {String} message The message to display inside the submit button. Passing in nothing or
 *                          null reverts the display message to its default, which is an emoticon
 *                          noseless smiley face. 
 */
function renderSubmitInfo(message) {
  document.getElementById('login-form-button').value = message || ':)';
}

/**
 * Either shows or hides the loading overlay
 * @param  {boolean} shouldShow Whether the loading overlay should be rendered; true for render.
 *                              This function will do nothing if the type of shouldShow passed in
 *                              is not boolean.
 */
function renderLoading(shouldShow) {
  // do nothing if there is no loading overlay on the DOM
  if (document.getElementsByClassName('loading-overlay').length <= 0) {
    return;
  }

  // renders or hides the loading overlay depending on shouldShow
  if (shouldShow === true) {
    document.getElementsByClassName('loading-overlay')[0].style.display = 'flex';
  } else if (shouldShow === false) {
    document.getElementsByClassName('loading-overlay')[0].style.display = 'none';
  }
}

// Handlers and event listeners

/**
 * Handles login button click event. Checks for password validity, and then authenticates user.
 */
function handleLogin() {
  renderLoading(true);

  // check for valid password entry, and notifies user if invalid
  const password = document.getElementById('login-form-input').value;
  if (!password || typeof password !== 'string' || !password.trim()) {
    renderLoading(false);
    renderSubmitInfo(':(');
    return;
  }

  // signs user in with Firebase Authentication, and notifies user of error if occurring
  firebase.auth().signInWithEmailAndPassword(USER_EMAIL, password).catch((error) => {
    console.error(error);
    renderLoading(false);
    renderSubmitInfo(`:(`);
  });
}


document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  handleLogin();
});

/**
 * On window load, sets up Firebase Auth listener. Will redirect user to pad selection screen
 *   if user is already logged in. Also handles loading screen 
 */
window.onload = () => {
  // detects existing log-in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      renderSubmitInfo(':)');
      window.location.assign('select.html');
    } else {
      renderLoading(false);
    }
  });
};
