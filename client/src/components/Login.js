import React, { useState, useEffect } from "react";
import {
  auth,
  signInWithGoogle,
  logout,
  getUserData,
  subscribeToUserUpdates,
} from "../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const Login = ({ user,setUser }) => {
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);

        const userData = await getUserData(user.uid);
        setUser(userData);

        const unsubscribeUpdates = subscribeToUserUpdates(user.uid, setUser);

        return () => unsubscribeUpdates();
      } else {
        setToken(null);
        setUser(null);
        setData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const idToken = await signInWithGoogle();
      setToken(idToken);
    } catch (error) {
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
    setUser(null);
    setData(null);
  };

  const handleAccessProtectedRoute = async () => {
    if (!token) {
      alert("Please log in first!");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/protected", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (error) {
      alert("Error accessing protected route: " + error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getUserData(user.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          {token ? "Welcome Back!" : "Welcome"}
        </h2>

        {!token ? (
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2 mb-3 text-white bg-blue-500 hover:bg-blue-600 transition rounded-md disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login with Google"}
          </button>
        ) : (
          <>
            <button
              onClick={handleAccessProtectedRoute}
              className="w-full py-2 mb-3 text-white bg-green-500 hover:bg-green-600 transition rounded-md"
            >
              Access Protected Route
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2 text-white bg-red-500 hover:bg-red-600 transition rounded-md"
            >
              Logout
            </button>

            {user && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
                <p className="text-gray-700 font-semibold">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            )}
          </>
        )}

        {data && (
          <pre className="mt-4 p-3 text-sm bg-gray-200 rounded-md text-left">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default Login;
