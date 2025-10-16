
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
import localApiClient from '../api/localApiClient';

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
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Garante que o perfil do usuário exista no banco de dados local
      await localApiClient.post('/user-profile', {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      });

      handleAuthSuccess(onSuccess);
    } catch (error) {
      console.error("Google Sign-In Error", error);
      throw error;
    }
  };

  const signup = async (email, password, name, onSuccess) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salva o perfil do usuário no banco de dados local
      await localApiClient.post('/user-profile', {
        uid: user.uid,
        name,
        email,
      });

      // Atualiza o currentUser com os dados do perfil
      setCurrentUser({ ...user, name, email });

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await localApiClient.get(`/profile/${user.uid}`);
          setCurrentUser({ ...user, ...profile });
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
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
