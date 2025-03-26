import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";
import { UsersManager } from "../../../../api/features/users/manage";
import { useAuth } from "../../../../context/AuthContext";
import { useLoading } from "../../../../context/LoadingContext";
import { validateProfileForm, validateProfilePicture } from "../../../../api/features/users/validators";
import FormField from "./components/FormField";
import ProfilePictureUpload from "./components/ProfilePictureUpload";

Modal.setAppElement("#root");

const EditProfile = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    bio: "",
    about: "",
    contact: "",
  });

  const [previewImage, setPreviewImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { updateUserData } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const usersManager = new UsersManager();

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        email: profile.email || "",
        bio: profile.bio || "",
        about: profile.about || "",
        contact: profile.contact || "",
      });
      setPreviewImage(profile.profile_picture || "");
      setSelectedImage(null);
      setError(null);
      setValidationErrors({});
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showLoading();
        const imageError = validateProfilePicture(file);
        if (imageError) {
          setError(imageError);
          return;
        }
        setSelectedImage(file);
        setPreviewImage(URL.createObjectURL(file));
        setError(null);
      } catch (error) {
        setError("Failed to process image. Please try again.");
      } finally {
        hideLoading();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { errors, isValid } = validateProfileForm(formData);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      showLoading();
      const submitFormData = new FormData();
      
      if (selectedImage) {
        submitFormData.append('profile_picture', selectedImage);
      }
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitFormData.append(key, formData[key]);
        }
      });

      const response = await usersManager.updateProfile(submitFormData);
      
      if (response) {
        updateUserData(response);
        if (onProfileUpdate) {
          onProfileUpdate({ data: response });
        }
        onClose();
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      hideLoading();
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white w-full max-w-2xl border-2 border-black max-h-[80vh] overflow-y-scroll no-scrollbar mt-20">
        <div className="flex justify-between items-center p-4 border-b-2 border-black sticky z-10 top-0 bg-white">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:text-gray-600"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <ProfilePictureUpload
            previewImage={previewImage}
            onImageChange={handleImageChange}
            error={error}
          />

          <div className="space-y-4">
            <FormField
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              error={validationErrors.full_name}
              maxLength={100}
            />

            <FormField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={validationErrors.username}
              maxLength={50}
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={validationErrors.email}
            />

            <FormField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              error={validationErrors.bio}
              maxLength={500}
              isTextArea={true}
              placeholder="Write a short bio about yourself"
            />

            <FormField
              label="Contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              error={validationErrors.contact}
              placeholder="Enter your contact number"
            />

            <FormField
              label="About"
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              error={validationErrors.about}
              maxLength={1000}
              isTextArea={true}
              textAreaHeight="h-32"
              placeholder="Tell us more about yourself"
            />
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProfile;
