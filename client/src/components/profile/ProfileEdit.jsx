import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, MapPin, Phone, User } from "lucide-react";
import { Avatar } from "../common";

const ProfileEdit = ({ user, onSave, isLoading = false }) => {
  const [formData, setFormData] = useState(
    user || {
      name: "",
      email: "",
      phone: "",
      location: { street: "", area: "" },
      bio: "",
      avatar: null,
      avatarUrl: "",
    },
  );

  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(user?.avatar);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLocationChange = (field, value) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [field]: value,
      },
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData({
          ...formData,
          avatar: file,
          avatarUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.location && !formData.location.area)
      newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-8 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Profile Picture
          </label>
          <div className="flex items-center gap-6">
            <Avatar src={previewUrl} size="lg" />
            <div className="flex-1">
              <label className="block p-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-primary-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input pl-11 w-full ${errors.name ? "border-red-500" : ""}`}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled
            className="input w-full opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="input pl-11 w-full"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold mb-2">Location *</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Street"
                value={formData.location?.street || ""}
                onChange={(e) => handleLocationChange("street", e.target.value)}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Area/City"
                value={formData.location?.area || ""}
                onChange={(e) => handleLocationChange("area", e.target.value)}
                className={`input w-full text-sm ${errors.location ? "border-red-500" : ""}`}
              />
            </div>
          </div>
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows="4"
            maxLength="200"
            className="input w-full resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.bio?.length || 0}/200 characters
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 btn btn-primary py-3"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileEdit;
