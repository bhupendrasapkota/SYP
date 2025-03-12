import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

const ProfileMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      to: `/profile/${user?.username}`,
      icon: <FaUser />,
      label: "View Profile",
    },
    {
      to: "/settings",
      icon: <FaCog />,
      label: "Settings",
    },
    {
      to: "/logout",
      icon: <FaSignOutAlt />,
      label: "Logout",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 border-2 border-black px-3 py-2 hover:bg-black hover:text-white transition-all duration-300"
      >
        <img
          src={user?.profile_picture || "https://via.placeholder.com/32"}
          alt={user?.username || "User"}
          className="w-8 h-8 object-cover"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-lg">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-black hover:text-white transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
