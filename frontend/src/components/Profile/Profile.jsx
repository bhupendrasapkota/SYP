import Post from "./Post/Post.jsx";
import Postedpictures from "./Posteditems/Postedpictures.jsx";
import Profile from "./UserProfile/Profile.jsx";

const Profie = () => {
  return (
    <div className="w-full min-h-screen bg-white mt-20">
      <div className="w-full px-2">
        <div className="transition-all duration-300 ease-in-out">
          <Profile />
        </div>
        <div className="w-full border-t-2 border-black transition-all duration-300 ease-in-out">
          <Post />
        </div>
        <div className="w-full border-t-2 border-black transition-all duration-300 ease-in-out">
          <Postedpictures />
        </div>
      </div>
    </div>
  );
};

export default Profie;
