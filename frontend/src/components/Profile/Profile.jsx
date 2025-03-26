import Post from "./Post/Post.jsx";
import MainProfile from "./UserProfile/MainProfile.jsx";

const Profile = () => {
  return (
    <div className="w-full min-h-screen bg-white mt-20">
      <div className="w-full px-2">
        <div className="transition-all duration-300 ease-in-out">
          <MainProfile />
        </div>
        <div className="w-full border-t-2 border-black transition-all duration-300 ease-in-out">
          <Post />
        </div>
      </div>
    </div>
  );
};

export default Profile;
