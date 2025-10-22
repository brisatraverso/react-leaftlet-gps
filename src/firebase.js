// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyDrJByJlvjgzF-Q6rZn1d3pMLSH6JmcXD8",

  authDomain: "rastreo-gps-f15f7.firebaseapp.com",

  projectId: "rastreo-gps-f15f7",

  storageBucket: "rastreo-gps-f15f7.firebasestorage.app",

  messagingSenderId: "374522324465",

  appId: "1:374522324465:web:f278b35dc8571fa74a9050"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;