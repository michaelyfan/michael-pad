import firebase from 'firebase';

// Firebase configuration
let firebaseConfig = {
  apiKey: "AIzaSyBvrxucljZZtnWWNklG7TmWNiULUMgEryA",
  authDomain: "game-notes-e5a6a.firebaseapp.com",
  databaseURL: "https://game-notes-e5a6a.firebaseio.com",
  projectId: "game-notes-e5a6a",
  storageBucket: "",
  messagingSenderId: "540025431430",
  appId: "1:540025431430:web:acb640866b3481c3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export { firebase };
