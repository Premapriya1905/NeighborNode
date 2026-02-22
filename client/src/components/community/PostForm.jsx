import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { Avatar } from "../common";

const PostForm = ({ onSubmit, isLoading = false, userAvatar, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const CATEGORIES = [
    "General",
    "Looking For",
    "Offering",
    "Events",
    "Questions",
    "Recommendations",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: "Image size must be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: file });
        setErrors({ ...errors, image: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = "Post content is required";
    }
    if (formData.content.trim().length < 5) {
      newErrors.content = "Post must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ title: "", content: "", category: "General", image: null });
      setImagePreview(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-strong rounded-2xl p-6 mb-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Section */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
          <Avatar src={userAvatar} size="md" />
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share with your community..."
            rows="3"
            maxLength="500"
            className={`input flex-1 resize-none ${errors.content ? "border-red-500" : ""}`}
          />
        </div>

        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content}</p>
        )}

        {/* Title (Optional) */}
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Add a title (optional)"
          maxLength="100"
          className="input w-full"
        />

        {/* Category */}
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="input w-full"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Image Preview */}
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative rounded-xl overflow-hidden max-h-48"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setFormData({ ...formData, image: null });
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Add Image</span>
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary px-6 py-2"
          >
            {isLoading ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Character Count */}
        <p className="text-xs text-gray-500 text-right">
          {formData.content.length}/500 characters
        </p>
      </form>
    </motion.div>
  );
};

export default PostForm;
