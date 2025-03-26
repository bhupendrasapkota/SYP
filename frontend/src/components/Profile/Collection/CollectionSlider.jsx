import React, { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaImages, FaPlus } from 'react-icons/fa';
import CollectionCard from '../../../components/Screen/Collection/CollectionCard';
import CreateCollection from '../../../components/Screen/Collection/CreateCollection';

const EmptyState = memo(() => (
  <div className="text-center py-8 text-black border-2 border-black p-4" role="status">
    <FaImages className="w-12 h-12 mx-auto mb-2 text-black" aria-hidden="true" />
    <p>No collections found</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

const CollectionSlider = memo(({ 
  collections = [], 
  title = 'Collections', 
  isModalOpen = false,
  onCollectionUpdate
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    if (onCollectionUpdate) {
      onCollectionUpdate();
    }
  }, [onCollectionUpdate]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipe: !isCreateModalOpen && !isModalOpen,
    touchMove: !isCreateModalOpen && !isModalOpen,
    arrows: !isCreateModalOpen && !isModalOpen,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          swipe: !isCreateModalOpen && !isModalOpen,
          touchMove: !isCreateModalOpen && !isModalOpen,
          arrows: !isCreateModalOpen && !isModalOpen
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          swipe: !isCreateModalOpen && !isModalOpen,
          touchMove: !isCreateModalOpen && !isModalOpen,
          arrows: !isCreateModalOpen && !isModalOpen
        }
      }
    ]
  };

  if (!collections?.length) {
    return <EmptyState />;
  }

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-4">
        <div className="flex items-center gap-2">
          <FaImages className="w-6 h-6 text-black" aria-hidden="true" />
          <h2 className="text-xl font-bold text-black">{title}</h2>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 border-2 border-black px-4 py-1 text-sm font-medium text-black hover:bg-black hover:text-white transition-all duration-300"
            aria-label="Create new collection"
          >
            <FaPlus className="w-4 h-4" aria-hidden="true" />
            Create Collection
          </button>
          <span 
            className="text-sm text-black border-2 border-black px-3 py-1"
            role="status"
          >
            {collections.length} collections
          </span>
        </div>
      </div>

      <div className="relative px-4">
        <div 
          className={`[&_.slick-track]:flex [&_.slick-track]:gap-4 [&_.slick-slide]:h-auto [&_.slick-slide>div]:h-full [&_.slick-prev]:w-[30px] [&_.slick-prev]:h-[30px] [&_.slick-prev]:-left-[35px] [&_.slick-prev]:z-10 [&_.slick-next]:w-[30px] [&_.slick-next]:h-[30px] [&_.slick-next]:-right-[35px] [&_.slick-next]:z-10 [&_.slick-prev:before]:text-black [&_.slick-prev:before]:text-[30px] [&_.slick-next:before]:text-black [&_.slick-next:before]:text-[30px] ${(isCreateModalOpen || isModalOpen) ? '[&_.slick-prev]:hidden [&_.slick-next]:hidden' : ''}`}
          aria-label="Collections slider"
        >
          <Slider {...settings}>
            {collections.map((collection) => (
              <div key={collection.id} className="px-2">
                <CollectionCard 
                  collection={collection}
                  onUpdate={onCollectionUpdate}
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <CreateCollection 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
});

CollectionSlider.propTypes = {
  collections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    // Add other collection prop types as needed
  })),
  title: PropTypes.string,
  isModalOpen: PropTypes.bool,
  onCollectionUpdate: PropTypes.func
};

CollectionSlider.displayName = 'CollectionSlider';

export default CollectionSlider; 