import React, { memo } from 'react';
import { FaUser, FaPhone, FaPencilRuler } from "react-icons/fa";

const ContentSection = memo(({ icon: Icon, title, content }) => (
  <div className="w-full sm:w-1/3 flex flex-col">
    <div className="flex items-center gap-3 mb-3">
      <Icon className="w-5 h-5 text-black" aria-hidden="true" />
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
    </div>
    <div className="border-2 border-black p-4 flex-1 min-h-[150px]">
      <p className="text-gray-800 text-sm sm:text-base break-words whitespace-pre-wrap max-w-full leading-relaxed">
        {content || (
          <span className="text-gray-500 italic">No {title.toLowerCase()} available</span>
        )}
      </p>
    </div>
  </div>
));

ContentSection.displayName = 'ContentSection';

const ProfileContent = memo(({ profile }) => {
  if (!profile) return null;

  const sections = [
    {
      icon: FaUser,
      title: 'Bio',
      content: profile.bio
    },
    {
      icon: FaPhone,
      title: 'Contact',
      content: profile.contact
    },
    {
      icon: FaPencilRuler,
      title: 'About',
      content: profile.about
    }
  ];

  return (
    <div className="mt-4 w-full flex flex-col sm:flex-row gap-6">
      {sections.map((section, index) => (
        <ContentSection
          key={section.title}
          icon={section.icon}
          title={section.title}
          content={section.content}
        />
      ))}
    </div>
  );
});

ProfileContent.displayName = 'ProfileContent';

export default ProfileContent; 