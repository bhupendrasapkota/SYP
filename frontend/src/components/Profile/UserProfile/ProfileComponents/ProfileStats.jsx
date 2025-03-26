import React, { useState, memo } from 'react';
import { FaCalendarAlt } from "react-icons/fa";
import FollowListModal from './FollowListModal';
import { motion } from 'framer-motion';

const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Unknown";
  }
};

const ProfileStats = memo(({ profile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState('followers');

  if (!profile) return null;

  const handleOpenModal = (tab) => {
    setInitialTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-row justify-between border-b-2 border-black">
        <div className="flex gap-6">
          <motion.button
            onClick={() => handleOpenModal('followers')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="cursor-pointer text-left"
            aria-label={`${profile.followers_count || 0} followers`}
          >
            <span className="font-bold text-base sm:text-lg tracking-tight">
              {profile.followers_count || 0}
            </span>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Followers
            </p>
          </motion.button>
          <motion.button
            onClick={() => handleOpenModal('following')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="cursor-pointer text-left"
            aria-label={`${profile.following_count || 0} following`}
          >
            <span className="font-bold text-base sm:text-lg tracking-tight">
              {profile.following_count || 0}
            </span>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Following
            </p>
          </motion.button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <FaCalendarAlt className="text-gray-600" aria-hidden="true" />
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Member since
          </p>
          <div>
            <span className="font-medium text-sm sm:text-sm tracking-tight">
              {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>

      <FollowListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        username={profile.username}
        initialTab={initialTab}
      />
    </>
  );
});

ProfileStats.displayName = 'ProfileStats';

export default ProfileStats; 