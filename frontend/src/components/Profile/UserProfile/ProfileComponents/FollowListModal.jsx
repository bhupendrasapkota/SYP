import React, { useEffect, useState, useCallback } from 'react';
import Modal from 'react-modal';
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';
import { UsersManager } from '../../../../api/features/users/manage';
import { IoPerson } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import { useLoading } from '../../../../context/LoadingContext';
import { useUIState } from '../../../../context/UIStateContext';
import { useDataSync } from '../../../../context/DataSyncContext';

const FollowListModal = ({ isOpen, onClose, username, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [unfollowing, setUnfollowing] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useUIState();
  const { updateFollowData } = useDataSync();
  const usersManager = new UsersManager();

  const fetchData = useCallback(async () => {
    if (!username) return;
    
    try {
      setIsLoading(true);
      showLoading();
      
      const [followersData, followingData] = await Promise.all([
        usersManager.getFollowers(username),
        usersManager.getFollowing(username)
      ]);
      
      setFollowers(followersData?.data || []);
      setFollowing(followingData?.data || []);
    } catch (err) {
      showNotification('Failed to load data. Please try again.', 'error');
      console.error('Error fetching followers/following:', err);
    } finally {
      hideLoading();
      setIsLoading(false);
    }
  }, [username, showLoading, hideLoading, showNotification]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab(initialTab);
      setShowAll(false);
      fetchData();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialTab, username, fetchData]);

  const handleUnfollow = async (user) => {
    if (!user?.username) return;

    try {
      setUnfollowing(prev => ({ ...prev, [user.username]: true }));
      
      await usersManager.unfollowUser(user.username);
      
      // Update local state
      setFollowing(prev => prev.filter(f => f.username !== user.username));
      
      // Update global state
      updateFollowData({
        type: 'unfollow',
        username: user.username
      });
      
      showNotification(`Unfollowed ${user.username}`, 'success');
    } catch (err) {
      showNotification('Failed to unfollow user. Please try again.', 'error');
      console.error('Error unfollowing user:', err);
    } finally {
      setUnfollowing(prev => ({ ...prev, [user.username]: false }));
    }
  };

  const tabs = [
    { id: 'followers', label: 'Followers', count: followers?.length || 0 },
    { id: 'following', label: 'Following', count: following?.length || 0 }
  ];

  const currentUsers = activeTab === 'followers' 
    ? followers 
    : following.filter(user => user.following?.username !== username);
  const displayedUsers = showAll ? currentUsers : currentUsers?.slice(0, 3);
  const hasMoreUsers = currentUsers?.length > 3;

  const tabVariants = {
    active: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    inactive: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const getProfilePicture = (user) => {
    return user.profile_picture || "default-avatar.png";
  };

  const getUserInfo = (user) => {
    return {
      name: user.full_name || user.username,
      username: user.username,
      bio: user.bio || ""
    };
  };

  const renderProfilePicture = (user) => {
    const profilePicture = getProfilePicture(user);
    if (profilePicture) {
      return (
        <img
          src={profilePicture}
          alt={getUserInfo(user).username}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <IoPerson className="w-6 h-6 text-gray-500" />
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-96 h-[500px] border-2 border-black flex flex-col"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      {/* Fixed Header */}
      <div className="flex justify-between items-center p-6 border-b-2 border-black bg-white">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowAll(false);
              }}
              className={`font-semibold tracking-tight relative ${
                activeTab === tab.id ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
              variants={tabVariants}
              animate={activeTab === tab.id ? "active" : "inactive"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label} ({tab.count})
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </motion.button>
          ))}
        </div>
        <motion.button 
          onClick={onClose} 
          className="text-black hover:bg-black hover:text-white p-2 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <IoClose size={24} />
        </motion.button>
      </div>
      
      {/* Fixed Height Scrollable Content */}
      <div className="flex-1 overflow-y-auto h-[400px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 font-medium">Loading...</p>
                </div>
              ) : currentUsers?.length > 0 ? (
                <>
                  {displayedUsers.map((user) => {
                    const { username, name } = getUserInfo(user);
                    return (
                      <motion.div 
                        key={user.id} 
                        className="flex items-center gap-4 p-3 hover:bg-transparent transition-all duration-300 border border-transparent hover:border-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border-2 border-black w-12 h-12 flex-shrink-0 overflow-hidden">
                          {renderProfilePicture(user)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold block truncate">
                            {name}
                          </span>
                          <span className="text-gray-600 text-sm truncate">
                            @{username}
                          </span>
                        </div>
                        {activeTab === 'following' && (
                          <motion.button
                            onClick={() => handleUnfollow(user)}
                            disabled={unfollowing[user.username]}
                            className="px-4 py-1.5 text-sm font-medium text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {unfollowing[user.username] ? 'Unfollowing...' : 'Unfollow'}
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                  {hasMoreUsers && !showAll && (
                    <motion.button
                      onClick={() => setShowAll(true)}
                      className="w-full py-2 text-sm font-medium text-black hover:text-gray-600 flex items-center justify-center gap-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Show more <IoChevronDown />
                    </motion.button>
                  )}
                </>
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-gray-600 font-medium">No {activeTab} yet</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

export default FollowListModal; 