import React from "react";
import Banner from "./Home_banner/Banner";
import Article from "./Articles/Article";
import Recent from "./Recents/Recent";
import Recently from "./RecentlyAddedArt/Recentlyart";

const Home = () => {
  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto px-4">
        <Banner />
        <Article />
        <Recent />
        <Recently />
      </div>
    </div>
  );
};

export default Home;
