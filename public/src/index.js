import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyDEOzKoxLxyiUhQoNBAJXGlxBTaDs_kxO8",
  authDomain: "cactoots-544c1.firebaseapp.com",
  databaseURL: "https://cactoots-544c1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cactoots-544c1",
  storageBucket: "cactoots-544c1.appspot.com",
  messagingSenderId: "829920313384",
  appId: "1:829920313384:web:a755fa3e1459c663f6751d"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };