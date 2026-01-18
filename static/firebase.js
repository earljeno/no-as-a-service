import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDyeXPpYKX48w_L6mzhV_gVoMKGh8y83Ek",
    authDomain: "garcia-e569f.firebaseapp.com",
    projectId: "garcia-e569f",
    storageBucket: "garcia-e569f.firebasestorage.app",
    messagingSenderId: "763406551696",
    appId: "1:763406551696:web:6a1dbb7d76c02da9d6e615"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
const subscribers = new Set();
let initialized = false;

// Centralized auth listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    initialized = true;           // mark auth as initialized
    subscribers.forEach(fn => fn(user, initialized));
});

// Subscribe to auth changes
function onAuthChange(fn) {
    if (typeof fn === 'function') subscribers.add(fn);
    // Do NOT call immediately; wait for initialization
}

// Auth helper functions
function register(email, password) { return createUserWithEmailAndPassword(auth, email, password); }
function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
function logout() { return signOut(auth); }
function getCurrentUser() { return currentUser; }

export { app, auth, db, register, login, logout, onAuthChange, getCurrentUser };
