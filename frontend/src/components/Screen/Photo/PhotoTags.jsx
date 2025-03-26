import React from 'react';
import { FaTags } from 'react-icons/fa';

const Tag = ({ text }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
    {text}
  </span>
);

const PhotoTags = ({ tags = [], isAIGenerated = false }) => {
  if (!tags?.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FaTags className="text-gray-600" />
        <span className="text-gray-600 font-medium">
          {isAIGenerated ? 'AI-Generated Tags' : 'Tags'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Tag key={`${tag}-${index}`} text={tag} />
        ))}
      </div>
    </div>
  );
};

export default PhotoTags; 