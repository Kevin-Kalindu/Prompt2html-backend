// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBue2z-7FH-Oglehqb4GPvEoV2Gg6Q9o9k",
  authDomain: "html-54c23.firebaseapp.com",
  projectId: "html-54c23",
  storageBucket: "html-54c23.firebasestorage.app",
  messagingSenderId: "284853303792",
  appId: "1:284853303792:web:64d7fdaceaa8d45897c535",
  measurementId: "G-XHB0PTD4M8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app)
const storage = getStorage(app)
export {app, db, storage}