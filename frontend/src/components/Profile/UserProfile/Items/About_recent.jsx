import React from "react";

const About_recent = () => {
  // Sample data for UI layout
  const sampleRecentPosts = [
    {
      id: 1,
      image: "/sample-artwork-1.jpg",
    },
    {
      id: 2,
      image: "/sample-artwork-2.jpg",
    },
    {
      id: 3,
      image: "/sample-artwork-3.jpg",
    },
  ];

  return (
    <section>
      {/* Main Content Section */}
      <div className="flex-grow grid grid-row-3 gap-6">
        {/* Recent Artworks Section */}
        <div className="border">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b border-black pb-4">
              Recent Artworks
            </h3>
          </div>
          <div className="flex flex-wrap m-2 gap-4">
            {sampleRecentPosts.map((post) => (
              <img
                key={post.id}
                src={post.image}
                alt="Artwork"
                className="w-24 h-24 rounded-md object-cover shadow-md"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About_recent;
