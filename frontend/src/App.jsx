import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import React from "react";
import Navbar from "./components/Nav/Navbar";
import Home from "./pages/Entry/Home";
import Footer from "./components/Footer/Footer";
import Login from "./pages/register/login";
import Signup from "./pages/register/signup";
import Explore from "./pages/Explore/Explore";
import Collect from "./pages/Collection/collection";
import Trending from "./pages/Trending/Trending";
import User from "./pages/User/Users";
import Profile from "./components/Profile/Profile";
import NotFound from "./pages/NotFound/Notfound";
import { LoadingProvider } from './context/LoadingContext';
import { AuthProvider } from './context/AuthContext';
import { DataSyncProvider } from './context/DataSyncContext';
import { UIStateProvider } from './context/UIStateContext';
import LoadingOverlay from './components/Screen/Common/LoadingOverlay';
import { useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialLoad } = useAuth();
  
  // Show nothing while checking auth state
  if (isInitialLoad) {
    return null;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <LoadingProvider>
      <DataSyncProvider>
        <UIStateProvider>
          <AuthProvider>
            <Router>
              <LoadingOverlay />
              <Navbar />
              <main>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/collection" element={<Collect />} />
                  <Route path="/users" element={<User />} />

                  {/* Protected Profile Route */}
                  <Route 
                    path="/profile/:username?" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </Router>
          </AuthProvider>
        </UIStateProvider>
      </DataSyncProvider>
    </LoadingProvider>
  );
}

export default App;
