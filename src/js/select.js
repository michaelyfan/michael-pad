import { firebase } from './config';
import '../css/global.css';
import '../css/select.css';

// initializes Firestore object
const db = firebase.firestore();


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
 * Populates the list of pads on the pad selection screen.
 * @param {Array} pads An array of pads, where a pad object has the structure:
 * {
 *   name: String, name of the pad
 *   id: String, 
 * }
 */
function renderPads(pads) {
  let newContent = '';
  pads.forEach((pad) => {
    const { name, id } = pad;
    // adds this game's row to the DOM
    newContent += 
    `<div class='game-row'>
      <button class='game-row-button btn btn-gold' id='${id}'>${name}</button>
    </div>`;
  })

  document.getElementById('games').innerHTML = newContent;

  // adds click listeners for the game buttons created
  // this method (event delegation) is simpler and more performant than adding event listeners in
  // the above loop on a per-button basis, according to:
  // https://gomakethings.com/why-event-delegation-is-a-better-way-to-listen-for-events-in-vanilla-js/
  document.addEventListener('click', function (event) {
    if (event.target.matches('.game-row-button')) {
      launchPad(event.target.id);
    }
  }, false);
}


/**
 * Either shows or hides the form for adding new games, and also shows or hides the button that
 *   initially toggles the new game form.
 * @param  {boolean} shouldRender Whether the add game form should be hidden or shown. If this is
 *                                not a valid boolean type, then this function will do nothing
 */
function renderAddGameForm(shouldRender) {
  if (shouldRender === true) {
    document.getElementById('add-game-form').style.display = 'block';
    document.getElementById('add-game-toggle').style.display = 'none';
  } else if (shouldRender === false) {
    document.getElementById('add-game-form').style.display = 'none';
    document.getElementById('add-game-toggle').style.display = 'inline';
  }
}

/**
 * Clears the input of the add game name box
 */
function clearAddGameInput() {
  document.getElementById('add-game-input').value = '';
}

// General functions

/**
 * Sets the selected game state of the app and redirects to pad page.
 * @param  {String} id The ID of the game to set the state to. This ID is the same as the Firebase
 *                     UID of a game document.
 */
function launchPad(id) {
  sessionStorage.setItem('gameId', id);
  window.location.assign('pad.html');
}

/**
 * Retrieves pads from Firestore
 */
function getPads() {
  return db.collection('pads').get().then((res) => {
    
    // compile pad data
    const padsData = [];
    res.forEach((gameDoc) => {
      padsData.push({
        name: gameDoc.data().name,
        id: gameDoc.id
      });
    });

    // use pad data to render pads
    renderPads(padsData);

    // disable loading screen
    renderLoading(false);
  });
}

/**
 * Signs a user out. Will end their session with Firebase Auth.
 */
function signOut() {
  renderLoading(true);
  firebase.auth().signOut();
}

/**
 * Adds a new pad.
 * @param {String} name The name of the new pad to add. If null or empty, this function will return
 *                      with a promise rejection.
 * @return A Promise resolving to the result of the Firebase add operation, or rejecting to error.
 */
function addGame(name) {
  if (!name || !name.trim()) {
    return Promise.reject(new Error('Game name cannot be null or empty.'));
  }
  return db.collection('pads').add({ name });
}


// Handlers and event listeners

/**
 * Handles user attempt to add a game. Creates the new pad and refreshes the screen by getting
 *   pads again. Refresh will not occur if pad creation results in error.
 */
async function handleAddGameSubmit() {
  renderLoading(true);
  try {
    await addGame(document.getElementById('add-game-input').value);
  } catch (e) {
    renderLoading(false);
    alert(e);
    return;
  }

  // refresh the pads
  try {
    await getPads();
  } catch (e) {
    console.error(e);
    renderLoading(false);
    alert('Sorry! There was an error refreshing pads.\nTry refreshing the page.');
    return;
  }
  clearAddGameInput();
  renderLoading(false);
}

document.getElementById('add-game-toggle').addEventListener('click', () => { renderAddGameForm(true) });
document.getElementById('add-game-form').addEventListener('submit', (e) => {
  e.preventDefault();
  handleAddGameSubmit();
});
// document.getElementById('add-game-submit').addEventListener('click', handleAddGameSubmit);
document.getElementById('add-game-cancel').addEventListener('click', () => { renderAddGameForm(false) });
document.getElementById('sign-out-button').addEventListener('click', signOut);

/**
 * On window load, sets up Firebase Auth listener. Will retrieve list of pads if user is logged in,
 *   and will redirect to login screen if no one is logged in. 
 */
window.onload = () => {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      getPads().catch((e) => {
        console.error(e);
        alert(e);
      });
    } else {
      // User is signed out.
      window.location.assign('login.html');
    }
  });
};
