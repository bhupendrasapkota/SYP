import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditProfile from "./UserProfileEdit/EditProfile";
import CollectionList from "../Collection/CollectionList";
import { UsersManager } from "../../../api/features/users/manage";
import ProfileHeader from "./ProfileComponents/ProfileHeader";
import ProfileStats from "./ProfileComponents/ProfileStats";
import ProfileContent from "./ProfileComponents/ProfileContent";
import { useLoading } from "../../../context/LoadingContext";
import { useAuth } from '../../../context/AuthContext';

const MainProfile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { showLoading, hideLoading } = useLoading();
  const { user } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();
  const usersManager = new UsersManager();

  const fetchProfile = async () => {
    try {
      showLoading();
      setError(null);
      const userData = await usersManager.getUserProfile(username);
      setProfile(userData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error.message || "Failed to load profile");
    } finally {
      hideLoading();
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      showLoading();
      const response = await usersManager.updateProfile(updatedProfile.data);
      setProfile(response);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      hideLoading();
    }
  };

  // Don't show any error or profile content during initial load
  if (isInitialLoad) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded relative max-w-md w-full">
          <p className="font-bold">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded relative max-w-md w-full">
          <p className="font-bold">Profile not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <ProfileHeader 
        profile={profile}
        isCurrentUser={true}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      <div className="pt-16 sm:pt-20 px-4 sm:px-6">
        <ProfileStats profile={profile} />
        <ProfileContent profile={profile} />
        <div className="mt-6 sm:mt-8 pt-4">
          <CollectionList 
            username={profile.username} 
            isModalOpen={isEditModalOpen}
          />
        </div>
      </div>

      <EditProfile
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default MainProfile;
