import React, { memo } from 'react';
import { FaCamera } from 'react-icons/fa';

const DEFAULT_PROFILE_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSI1Ii8+PHBhdGggZD0iTTIwIDE5di0yYTcgNyAwIDAgMC0xNC0wdjJhMSAxIDAgMCAwIDEgMWgxMmExIDEgMCAwIDAgMS0xeiIvPjwvc3ZnPg==';

const ProfilePictureUpload = memo(({ 
  previewImage = DEFAULT_PROFILE_IMAGE, 
  onImageChange, 
  error 
}) => {
  const handleImageError = (e) => {
    e.target.src = DEFAULT_PROFILE_IMAGE;
  };

  return (
    <div className="mb-6">
      <label 
        htmlFor="profile-picture-upload" 
        className="block mb-2 font-bold"
      >
        Profile Picture
      </label>
      <div className="relative w-32 h-32 group cursor-pointer">
        <img
          src={previewImage}
          alt="Profile"
          onError={handleImageError}
          className="w-full h-full object-cover border-2 border-black"
        />
        <div 
          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center"
          aria-hidden="true"
        >
          <FaCamera className="text-white opacity-0 group-hover:opacity-100 w-8 h-8" />
        </div>
        <input
          id="profile-picture-upload"
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={onImageChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label="Upload profile picture"
          aria-describedby={error ? "profile-picture-error" : undefined}
          aria-invalid={Boolean(error)}
        />
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Supported formats: JPG, JPEG, PNG (max 5MB)
      </p>
      {error && (
        <p 
          id="profile-picture-error" 
          className="text-red-500 text-sm mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

ProfilePictureUpload.displayName = 'ProfilePictureUpload';

export default ProfilePictureUpload;
