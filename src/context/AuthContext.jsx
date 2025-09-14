
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = (onSuccess) => {
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess();
    } else {
      navigate('/home');
    }
  };

  const googleSignIn = async (onSuccess) => {
    try {
      await signInWithPopup(auth, googleProvider);
      handleAuthSuccess(onSuccess);
    } catch (error) {
      console.error("Google Sign-In Error", error);
      throw error;
    }
  };

  const signup = async (email, password, onSuccess) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      handleAuthSuccess(onSuccess);
    } catch (error) {
      console.error("Signup Error", error);
      throw error;
    }
  };

  const login = async (email, password, onSuccess) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      handleAuthSuccess(onSuccess);
    } catch (error) {
      console.error("Login Error", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    googleSignIn,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
