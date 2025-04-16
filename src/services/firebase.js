// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAjMMS4VQIAx-_Gqza09yiwghlOIxGN0eY",
  authDomain: "pinion-f3c93.firebaseapp.com",
  projectId: "pinion-f3c93",
  storageBucket: "pinion-f3c93.firebasestorage.app",
  messagingSenderId: "741762030741",
  appId: "1:741762030741:web:62f5a93897d44581104f9c",
  measurementId: "G-KKG0PZL8F7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };