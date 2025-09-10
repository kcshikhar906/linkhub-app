// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBvAdAje9JMFiBtvEjoYBKQbs3OdQJzx9w",
  authDomain: "studio-1056248946-53993.firebaseapp.com",
  projectId: "studio-1056248946-53993",
  storageBucket: "studio-1056248946-53993.firebasestorage.app",
  messagingSenderId: "727836921321",
  appId: "1:727836921321:web:bec8a97f1cd7a67fe5cf78",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);

export { app, auth };