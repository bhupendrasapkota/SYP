import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Feature Routes */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/collection" element={<Collect />} />
          <Route path="/users" element={<User />} />
          <Route path="/user/:username" element={<Profile />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
