import React, { memo } from 'react';
import { FaEdit } from "react-icons/fa";

const DEFAULT_PROFILE_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSI1Ii8+PHBhdGggZD0iTTIwIDE5di0yYTcgNyAwIDAgMC0xNC0wdjJhMSAxIDAgMCAwIDEgMWgxMmExIDEgMCAwIDAgMS0xeiIvPjwvc3ZnPg==';

const ProfileHeader = memo(({ profile, isCurrentUser, onEditClick }) => {
  const handleImageError = (e) => {
    e.target.src = DEFAULT_PROFILE_IMAGE;
  };

  if (!profile) return null;

  return (
    <>
      {/* Cover Image */}
      <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-gray-900 to-black relative">
        <div className="absolute -bottom-12 sm:-bottom-16 left-2 sm:left-4 border-4 border-white">
          <img
            src={profile?.profile_picture || DEFAULT_PROFILE_IMAGE}
            alt={`${profile.username}'s profile`}
            onError={handleImageError}
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
          />
        </div>
      </div>

      {/* Header Section */}
      <div className="pt-16 sm:pt-20 px-4 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-gray-600 font-medium">@{profile.username}</p>
          </div>
          {isCurrentUser && (
            <button
              onClick={onEditClick}
              className="border-2 border-black px-3 py-2 hover:bg-black hover:text-white transition-all duration-300 flex-shrink-0"
              aria-label="Edit profile"
            >
              <FaEdit className="w-5 h-5 bg-transparent" />
            </button>
          )}
        </div>
      </div>
    </>
  );
});

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader; 