import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyB5mooTHdMNegPVehYEiVWj46wmhMfq_Ns",
  authDomain: "attendance--tracker.firebaseapp.com",
  projectId: "attendance--tracker",
  storageBucket: "attendance--tracker.firebasestorage.app",
  messagingSenderId: "518253402297",
  appId: "1:518253402297:web:e5b76630305c85ca5e6368",
  measurementId: "G-N3BTNMCZ6Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };