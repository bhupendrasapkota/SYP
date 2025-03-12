import React, { useState } from "react";
import ProfileMenu from "./ProfileDropdown/ProfileMenu";
import AuthButtons from "./Auth/AuthButtons";

const UserSection = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // This will be replaced with actual auth state
  const [user, setUser] = useState({
    username: "johndoe",
    profile_picture: "https://source.unsplash.com/random/32x32",
  });

  return (
    <div className="flex items-center justify-center h-full">
      {isAuthenticated ? <ProfileMenu user={user} /> : <AuthButtons />}
    </div>
  );
};

export default UserSection;
