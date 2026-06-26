import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCSSLO4oVaf1BYxrB3SFpwds-cjGFzbtB0",
  authDomain: "gen-lang-client-0038776908.firebaseapp.com",
  projectId: "gen-lang-client-0038776908",
  storageBucket: "gen-lang-client-0038776908.firebasestorage.app",
  messagingSenderId: "99130218365",
  appId: "1:99130218365:web:0c95ca4ad39ca89a295e14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-shunsineminecraf-34891700-c381-4603-b71a-225adf0a73fa");
