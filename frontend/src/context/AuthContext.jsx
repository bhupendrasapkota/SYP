import React, { createContext, useContext, useState, useEffect } from 'react';
import { authManager } from '../api/features/auth/manage';
import userManager from '../api/features/users/manage';
import { useLoading } from './LoadingContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { showLoading, hideLoading } = useLoading();

  const fetchUserProfile = async () => {
    try {
      showLoading();
      const isAuth = authManager.getAuthState();
      
      if (isAuth) {
        // Get the current user's username from localStorage or another source
        const username = localStorage.getItem('username');
        if (username) {
          const userData = await userManager.getUserProfile(username);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      hideLoading();
      setIsInitialLoad(false);
    }
  };

  const updateUserData = (updatedData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedData
    }));
  };

  useEffect(() => {
    fetchUserProfile();

    // Use manager's built-in event system instead of window events
    const handleAuthStateChange = (isAuth) => {
      setIsAuthenticated(isAuth);
      if (!isAuth) {
        setUser(null);
      } else {
        fetchUserProfile();
      }
    };

    const handleUserDataChange = (userData) => {
      updateUserData(userData);
    };

    // Subscribe to auth manager events
    authManager.on('authStateChanged', handleAuthStateChange);
    userManager.on('userDataChanged', handleUserDataChange);

    // Cleanup subscriptions
    return () => {
      authManager.off('authStateChanged', handleAuthStateChange);
      userManager.off('userDataChanged', handleUserDataChange);
    };
  }, []);

  const value = {
    isAuthenticated,
    user,
    isInitialLoad,
    fetchUserProfile,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 