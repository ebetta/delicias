
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyDCErsDRuTlTePfJPHsiXmH8f1LY-Jn8eY",
  authDomain: "delicias-claudinha.firebaseapp.com",
  projectId: "delicias-claudinha",
  storageBucket: "delicias-claudinha.firebasestorage.app",
  messagingSenderId: "215942106941",
  appId: "1:215942106941:web:7fb16b615ad70d779ebf54",
  measurementId: "G-KVJLW2082T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
