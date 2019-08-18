import Quill from 'quill';

import { firebase } from './config';
import '../css/global.css';
import '../css/pad.css';

// initializes Firestore object
const db = firebase.firestore();

// The amount of time to wait after a user edit to automatically save changes
const UPDATE_WAIT = 2500;

// initializes and renders the Quill editor
let quill;
if (document.getElementById('quill-editor')) {
  quill = new Quill('#quill-editor', {
    theme: 'snow',
  });
}

// holds the ID of a timeout used during pad update process. Will hold a timeout that will save
// user changes after UPDATE_WAIT has elapsed. This timeout will reset and start again if user
// makes changes while a timeout is already in progress.
let updateTimeout;

// DOM functions

/**
 * Either shows or hides the loading overlay
 * @param  {boolean} shouldShow Whether the loading overlay should be rendered; true for render.
 *                              This function will do nothing if the type of shouldShow passed in
 *                              is not boolean.
 */
function renderLoading(shouldShow) {
  // renders or hides the loading overlay depending on shouldShow
  if (shouldShow === true) {
    document.getElementsByClassName('loading-overlay')[0].style.display = 'flex';
  } else if (shouldShow === false) {
    document.getElementsByClassName('loading-overlay')[0].style.display = 'none';
  }
}

/**
 * Will either show or hide the delete pad dialogue, and hides or shows the button that initially
 *   toggles the delete dialogue.
 * @return {[type]} [description]
 */

/**
 * Will either show or hide the delete pad dialogue, and hides or shows the button that initially
 *   toggles the delete dialogue.
 * @param  {boolean} shouldRender Whether the delete pad dialogue should be shown. If this value is
 *                                not a valid boolean type, nothing will happen.
 */
function renderDelete(shouldRender) {
  if (shouldRender === true) {
    document.getElementById('delete-button-wrapper').style.display = 'none';
    document.getElementById('delete-dialog').style.display = 'block';
  } else if (shouldRender === false) {
    document.getElementById('delete-button-wrapper').style.display = 'block';
    document.getElementById('delete-dialog').style.display = 'none';
  }
}

/**
 * Changes title of the pad to the specified word or phrase. 
 * @param  {String} title The word or phrase to use for the new title. Passing in nothing or null
 *                        clears the title. HTML elements can be passed, and will be rendered
 *                        correctly.
 */
function renderTitle(title) {
  document.getElementById('title').innerHTML = title || '';
}

// general functions

/**
 * Retrieves pad data from Firebase.
 * @param  {String} padId ID of the pad to retrieve
 * @return {Promise} a Promise resolving to 2-length array, or rejecting with a Firebase error.
 *                     The first element of the array is an array of operations with use with a
 *                     Delta (object specific to the Quill package).
 */
function getPad(padId) {
  if (!padId || !padId.trim()) {
    alert('Sorry! There was a problem retrieving this pad.\nTry accessing the pad another time.');
    window.location.assign('select.html');
  }

  return db.collection('pads').doc(padId).get().then((res) => {
    return [
      res.data().name,
      res.data().deltaOps
    ];
  });
}

/**
 * Updates a pad with new contents
 * @param  {String} padId  the ID of the pad to update
 * @param  {Array} newOps an array of Deltas (object specific to Quill package)
 * @return {Promise}        A Promise resolving to the result of the update operation or rejecting
 */
function updatePad(padId, newOps) {
  return db.collection('pads').doc(padId).update({
    deltaOps: newOps
  });
}

/**
 * Deletes the current pad, and redirects user to pad selection screen when finished or notifies
 *   if error happens.
 */
async function deletePad() {
  renderLoading(true);

  // gets the pad's name and ID for later use
  let padName;
  let padId;
  try {
    padId = sessionStorage.getItem('gameId');
    padName = (await getPad(padId))[0];
  } catch (e) {
    console.error(e);
    alert('There was an error deleting this pad; sorry! Try again at a later time.');
    renderLoading(false);
    return;
  }

  // validate user delete confirmation input
  const confirmInput = document.getElementById('delete-dialog-input').value;
  if (!confirmInput || !confirmInput.trim() || confirmInput !== padName) {
    alert('Wrong delete input!')
    renderLoading(false);
    return;
  }

  // delete the pad and redirect user to pad selection if successful
  db.collection('pads').doc(padId).delete().then(() => {
    window.location.assign('select.html');
  }).catch((err) => {
    console.error(err);
    alert('There was an error deleting this pad; sorry! Try again at a later time.');
    renderLoading(false);
  });
}

/**
 * Waits 5 seconds, then updates the pad with new content and refreshes the pad.
 * If there already is a countdown happening (this function was called less than 5 seconds prior),
 * the old countdown will be cancelled.
 */
function startUpdateCountdown() {
  if (updateTimeout) {
    window.clearTimeout(updateTimeout);
  }
  updateTimeout = window.setTimeout(() => {
    const padId = sessionStorage.getItem('gameId');
    const newContent = quill.getContents().ops;
    updatePad(padId, newContent).then(() => {
      return getPad(padId)[1]
    }).then((refreshedContent) => {
      const Delta = Quill.import('delta');

      // maintains user cursor position
      if (quill.getSelection()) {
        const currentIndex = quill.getSelection().index;
        quill.setContents(new Delta(refreshedContent));
        quill.setSelection(currentIndex);
      }
    }).catch((err) => {
      console.error(err);
      alert(err);
    });

  }, UPDATE_WAIT);
}

// starts the pad update process when user changes pad text.
quill.on('text-change', (delta, oldDelta, source) => {
  if (source === 'user') {
    startUpdateCountdown();
  }
});

/**
 * Signs a user out. Will end their session with Firebase Auth.
 */
function signOut() {
  renderLoading(true);
  firebase.auth().signOut();
}

// Handlers and event listeners

document.getElementById('sign-out-button').addEventListener('click', signOut);
document.getElementById('go-back').addEventListener('click', () => {
  window.location.assign('select.html');
});
document.getElementById('delete').addEventListener('click', () => {
  renderDelete(true);
});
document.getElementById('delete-dialog-yes').addEventListener('click', () => {
  deletePad();
});
document.getElementById('delete-dialog-no').addEventListener('click', () => {
  renderDelete(false);
});

// On load, retrieves pad name and data.
// Redirects to select page if there is no stored pad ID (implies direct navigation),
// Will reject to login screen if no user is detected logged in.
window.onload = () => {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // gets pad ID from session storage
      const padId = sessionStorage.getItem('gameId');
      if (!padId) {
        window.location.assign('select.html');
        return;
      }

      // gives pad data to Quill
      getPad(padId).then(([ name, ops ]) => {
        renderTitle(name);
        const Delta = Quill.import('delta');
        quill.setContents(new Delta(ops));
        renderLoading(false);
      }).catch((err) => {
        // redirect if error is encountered
        console.error('Error when retrieving pad:', err);
        alert('Sorry! There was a problem retrieving this pad.\nTry accessing the pad another time.');
        window.location.assign('select.html');
      });
    } else {
      // User is signed out.
      window.location.assign('login.html');
    }
  });
}
