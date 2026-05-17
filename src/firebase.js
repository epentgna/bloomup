import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDtxNDWKbfZmNaZnOdOl4cVHJScj1G2iQ8",
  authDomain: "focusapp-95fcd.firebaseapp.com",
  projectId: "focusapp-95fcd",
  storageBucket: "focusapp-95fcd.firebasestorage.app",
  messagingSenderId: "1083321197212",
  appId: "1:1083321197212:web:bc1b4e982a147ca99b4359",
  measurementId: "G-3D596GN9KY"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
