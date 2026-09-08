// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA92Kshp5powXHAGAjXErGC9oS6MrO52uE",
  authDomain: "reposteria-scarlet.firebaseapp.com",
  projectId: "reposteria-scarlet",
  storageBucket: "reposteria-scarlet.firebasestorage.app",
  messagingSenderId: "986566211666",
  appId: "1:986566211666:web:f9d462ff406c373deb478b",
  measurementId: "G-00728XRZV0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);