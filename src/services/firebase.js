import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxprXhR813kqDLk-yQ-uPE_lZ-Zof5kQc",
  authDomain: "my-gpt-9dd4e.firebaseapp.com",
  projectId: "my-gpt-9dd4e",
  storageBucket: "my-gpt-9dd4e.firebasestorage.app",
  messagingSenderId: "400147059819",
  appId: "1:400147059819:web:8c08b51f5e2001713dcd2e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
