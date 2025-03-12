import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { to: "/profile", icon: <FaUser />, label: "Profile" },
    { to: "/settings", icon: <FaCog />, label: "Settings" },
    { to: "/logout", icon: <FaSignOutAlt />, label: "Logout" },
  ];

  return (
    <div className="relative h-full flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
        aria-label="Toggle profile menu"
      >
        <FaUser className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-black shadow-lg">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-black hover:text-white transition-all duration-300 border-b-2 border-black last:border-b-0"
              onClick={() => setIsOpen(false)}
            >
              <span className="w-4 h-4">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
