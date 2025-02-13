import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_WEB_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    await setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName,
        email: user.email,
        profilePic: user.photoURL,
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );

    return idToken;
  } catch (error) {
    console.error("Google Sign-In Error", error);
  }
};

const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error fetching user data", error);
    return null;
  }
};

const subscribeToUserUpdates = (uid, callback) => {
  return onSnapshot(doc(db, "users", uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

const logout = async () => {
  await signOut(auth);
};

const messagesRef = collection(db, "messages");

const sendMessage = async (text, user) => {
  if (!text.trim()) return;
  await addDoc(messagesRef, {
    text,
    user,
    createdAt: new Date(),
  });
};

const listenMessages = (callback) => {
  const q = query(messagesRef, orderBy("createdAt"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

export {
  auth,
  db,
  signInWithGoogle,
  getUserData,
  subscribeToUserUpdates,
  logout,
  sendMessage,
  listenMessages,
  onAuthStateChanged,
};
