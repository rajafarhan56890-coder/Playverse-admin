import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCAHG3bGT8BPNRA8jigQbPKIX0ADpQlWE4",
  authDomain: "playverse-9e8ae.firebaseapp.com",
  projectId: "playverse-9e8ae",
  storageBucket: "playverse-9e8ae.firebasestorage.app",
  messagingSenderId: "1042768130587",
  appId: "1:1042768130587:web:b880752508443fcb067ebe",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
