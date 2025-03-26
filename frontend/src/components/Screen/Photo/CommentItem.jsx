import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';

const CommentItem = ({ comment, onDelete, canDelete }) => {
  const formattedDate = format(new Date(comment.created_at), 'MMM d, yyyy');

  return (
    <div className="flex items-start gap-4 p-4 border-b border-gray-200 last:border-b-0">
      <img
        src={comment.user.profile_photo || '/default-avatar.png'}
        alt={`${comment.user.username}'s avatar`}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{comment.user.username}</span>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Delete comment"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentItem; 