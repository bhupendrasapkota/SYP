import React from "react";
import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "../../../context/AuthContext";

/**
 * UserSection Component
 * Handles the display of authentication state in the header
 * Shows either:
 * - Login/Signup buttons for unauthenticated users
 * - Profile menu for authenticated users
 * - Nothing during initial load
 */
const UserSection = () => {
  const { user, isInitialLoad } = useAuth();

  if (isInitialLoad) return null;

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          to="/login"
          className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
          aria-label="Login"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
          aria-label="Sign Up"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return <ProfileMenu user={user} />;
};

export default UserSection; 