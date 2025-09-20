// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-5212451181-faa10",
  "appId": "1:1017346279490:web:e5fe1797f9ff175c3605db",
  "apiKey": "AIzaSyAkxs_Y63UgG2-sYq7m4BhVbaLA4L3ouMM",
  "authDomain": "studio-5212451181-faa10.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1017346279490"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
