import React from 'react';
import { FaHeart, FaDownload, FaComment } from 'react-icons/fa';

const StatItem = ({ icon: Icon, count, label }) => (
  <div className="flex items-center gap-2">
    <Icon className="text-gray-600" />
    <span className="text-gray-600">
      {count} {label}
    </span>
  </div>
);

const PhotoStats = ({ likes, downloads, comments }) => {
  const stats = [
    { icon: FaHeart, count: likes, label: 'Likes' },
    { icon: FaDownload, count: downloads, label: 'Downloads' },
    { icon: FaComment, count: comments, label: 'Comments' }
  ];

  return (
    <div className="flex gap-4">
      {stats.map(({ icon, count, label }) => (
        <StatItem key={label} icon={icon} count={count} label={label} />
      ))}
    </div>
  );
};

export default PhotoStats; 