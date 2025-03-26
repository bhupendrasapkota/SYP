import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { authApi } from "../../../api/features/auth";

const ProfileMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      window.dispatchEvent(new Event('userLoggedOut'));
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    {
      to: `/profile/${user?.username}`,
      icon: <FaUser className="bg-transparent" />,
      label: "View Profile",
    },
    {
      action: handleLogout,
      icon: <FaSignOutAlt className="bg-transparent" />,
      label: "Logout",
    },
  ];

  const handleImageError = () => {
    setImgError(true);
  };

  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`;

  return (
    <div className="relative pr-3" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-lg overflow-hidden"
        aria-label={isOpen ? "Close profile menu" : "Open profile menu"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          src={imgError ? fallbackAvatarUrl : user?.profile_picture}
          alt={`${user?.username || "User"}'s profile picture`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </button>

      <div 
        className={`absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-xl transform transition-all duration-300 ease-in-out origin-top-right ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
        role="menu"
        aria-label="Profile menu"
        aria-orientation="vertical"
      >
        {menuItems.map((item, index) => (
          item.action ? (
            <button
              key={index}
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
              className="w-full group flex items-center space-x-2 px-4 py-2 hover:bg-black transition-all duration-300 border-b border-gray-200 last:border-b-0"
              role="menuitem"
              aria-label={item.label}
            >
              <span className="w-5 h-5 text-black group-hover:text-white bg-transparent">{item.icon}</span>
              <span className="text-black group-hover:text-white bg-transparent">{item.label}</span>
            </button>
          ) : (
            <Link
              key={index}
              to={item.to}
              className="group flex items-center space-x-2 px-4 py-2 hover:bg-black transition-all duration-300 border-b border-gray-200 last:border-b-0"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              aria-label={item.label}
            >
              <span className="w-5 h-5 text-black group-hover:text-white bg-transparent">{item.icon}</span>
              <span className="text-black group-hover:text-white bg-transparent">{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

export default ProfileMenu;