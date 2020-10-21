import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
 // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyBYIGkMGrLEwfhJpenor0dmanO8EXYhvfw",
    authDomain: "fiverrproject-98c78.firebaseapp.com",
    databaseURL: "https://fiverrproject-98c78.firebaseio.com",
    projectId: "fiverrproject-98c78",
    storageBucket: "fiverrproject-98c78.appspot.com",
    messagingSenderId: "5142927462",
    appId: "1:5142927462:web:5f232bc989ce21a09ab5a7",
    measurementId: "G-ZBMMKH6JDK"
  };
  // Initialize Firebase
firebase.initializeApp(firebaseConfig)

// utils
const db = firebase.firestore()
const auth = firebase.auth()

// collection references
const tradeCollection = db.collection('trades')
const cycleCollection = db.collection('cycles')

// export utils/refs
export {
  db,
  auth,
  tradeCollection,
  cycleCollection
}
