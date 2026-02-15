import "./App.css";
import { useState, useRef } from "react";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { filterBadWords } from "./filterBadWords";

import { FaGoogle, FaSignOutAlt, FaPaperPlane } from "react-icons/fa";

const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyBq0XIwWv8JwYBmz3UKZuUJ2sS71CKM2r0",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "message-7783a.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "message-7783a",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "message-7783a.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "296643148399",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:296643148399:web:e3222baed0ea3c5900eb9a",
};

if (!process.env.REACT_APP_FIREBASE_API_KEY) {
  console.warn(
    "Firebase env variables not loaded. Make sure .env file exists and dev server was restarted.",
  );
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>HypeChat</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className="sign-in">
      <button onClick={signInWithGoogle}>
        <FaGoogle style={{ fontSize: "1.3rem" }} />
        Sign in with Google
      </button>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button
        onClick={() => auth.signOut()}
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.95rem",
        }}
      >
        <FaSignOutAlt />
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const messagesRef = db.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const dummy = useRef();

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = formValue.trim();
    if (!trimmedMessage) return;

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: filterBadWords(trimmedMessage),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Say something nice..."
          autoFocus
        />
        <button type="submit" disabled={!formValue.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={photoURL || "https://api.adorable.io/avatars/23/default.png"}
        alt="avatar"
      />
      <p>{filterBadWords(text)}</p>
    </div>
  );
}

export default App;
