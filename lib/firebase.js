import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAOcKUqJoEmQe1OfI8qiFlg--SDKS_IlXM",
  authDomain: "bingo-board-9d1a3.firebaseapp.com",
  projectId: "bingo-board-9d1a3",
  storageBucket: "bingo-board-9d1a3.firebasestorage.app",
  messagingSenderId: "434433857836",
  appId: "1:434433857836:web:b5699b5c34aa8722d13489",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged, db }
