// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAYlItLcL3oZ-VvYpkuh7zKimFyO79XHw",
  authDomain: "queuemanagementsystem-69ea3.firebaseapp.com",
  projectId: "queuemanagementsystem-69ea3",
  storageBucket: "queuemanagementsystem-69ea3.firebasestorage.app",
  messagingSenderId: "450009664590",
  appId: "1:450009664590:web:35775ca1f9303e4eaf071f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
