import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyD3AWY3Q23PrDgm_DeJSh5BF_1kdYJFFbI",
  authDomain: "kahaniexpress-743ad.firebaseapp.com",
  projectId: "kahaniexpress-743ad",
  storageBucket: "kahaniexpress-743ad.appspot.com",
  messagingSenderId: "1061575376016",
  appId: "1:1061575376016:web:215819120b6afbe11f2c15",
  measurementId: "G-2KT6LJ3Q1R"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (Platform.OS === 'web') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Persistence failed - multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.log('Persistence is not available in this browser');
    }
  });
} else {
  console.log('IndexedDB persistence is only available in web environments');
}

export { auth, db };
