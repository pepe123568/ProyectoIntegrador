
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAqmCkv7qxnnXCrt3xQpCYV4h9DSBhVI18',
  authDomain: 'kamur-veterinaria.firebaseapp.com',
  projectId: 'kamur-veterinaria',
  storageBucket: 'kamur-veterinaria.firebasestorage.app',
  messagingSenderId: '543256108865',
  appId: '1:543256108865:web:a998e4db005ab4bc7ecbc0',
  measurementId: 'G-D136FB8GRC'
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);