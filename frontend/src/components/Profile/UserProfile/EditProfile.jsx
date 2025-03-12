import React, { useState } from "react";
import Modal from "react-modal";
import { FaTimes, FaCamera } from "react-icons/fa";

Modal.setAppElement("#root");

const EditProfile = ({ isOpen, onClose, profile }) => {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    username: profile.username || "",
    email: profile.email || "",
    bio: profile.bio || "",
    about: profile.about || "",
    contact: {
      website: profile.contact?.website || "",
      location: profile.contact?.location || "",
      social: {
        twitter: profile.contact?.social?.twitter || "",
        instagram: profile.contact?.social?.instagram || "",
        github: profile.contact?.social?.github || "",
      },
    },
  });

  const [previewImage, setPreviewImage] = useState(profile.profile_picture);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child, subChild] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild
            ? {
                ...prev[parent][child],
                [subChild]: value,
              }
            : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // This will be connected to the backend API
    console.log("Form data:", { ...formData, profile_picture: selectedImage });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 "
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white w-full max-w-2xl border-2 border-black max-h-[80vh] overflow-y-scroll no-scrollbar mt-20 ">
        <div className="flex justify-between items-center p-4 border-b-2 border-black sticky z-10 top-0 bg-white">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:text-gray-600">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 ">
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block mb-2 font-bold">Profile Picture</label>
            <div className="relative w-32 h-32 group cursor-pointer">
              <img
                src={previewImage}
                alt="Profile"
                className="w-full h-full object-cover border-2 border-black"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <FaCamera className="text-white opacity-0 group-hover:opacity-100 w-8 h-8" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-bold">
                Full Name
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block mb-2 font-bold">
                Username
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block mb-2 font-bold">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block mb-2 font-bold">
                Bio
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none resize-none h-20"
                />
              </label>
            </div>

            <div>
              <label className="block mb-2 font-bold">
                About
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none resize-none h-32"
                />
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 border-t-2 border-black pt-4">
            <h3 className="text-lg font-bold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-bold">
                  Website
                  <input
                    type="text"
                    name="contact.website"
                    value={formData.contact.website}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                    placeholder="www.example.com"
                  />
                </label>
              </div>

              <div>
                <label className="block mb-2 font-bold">
                  Location
                  <input
                    type="text"
                    name="contact.location"
                    value={formData.contact.location}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                    placeholder="City, Country"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-6 border-t-2 border-black pt-4">
            <h3 className="text-lg font-bold mb-4">Social Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-bold">
                  Twitter
                  <input
                    type="text"
                    name="contact.social.twitter"
                    value={formData.contact.social.twitter}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                    placeholder="@username"
                  />
                </label>
              </div>

              <div>
                <label className="block mb-2 font-bold">
                  Instagram
                  <input
                    type="text"
                    name="contact.social.instagram"
                    value={formData.contact.social.instagram}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                    placeholder="@username"
                  />
                </label>
              </div>

              <div>
                <label className="block mb-2 font-bold">
                  GitHub
                  <input
                    type="text"
                    name="contact.social.github"
                    value={formData.contact.social.github}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border-2 border-black focus:outline-none"
                    placeholder="username"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProfile;
