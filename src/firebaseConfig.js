
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrJByJlvjgzF-Q6rZn1d3pMLSH6JmcXD8",
  authDomain: "rastreo-gps-f15f7.firebaseapp.com",
  databaseURL: "https://rastreo-gps-f15f7-default-rtdb.firebaseio.com",
  projectId: "rastreo-gps-f15f7",
  storageBucket: "rastreo-gps-f15f7.firebasestorage.app",
  messagingSenderId: "374522324465",
  appId: "1:374522324465:web:b84d11020360799f4a9050"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getDatabase(app);
export const auth = getAuth(app);
