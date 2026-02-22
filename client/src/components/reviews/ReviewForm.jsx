import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Rating } from "../common";

const ReviewForm = ({ onSubmit, isLoading = false, serviceName }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    text: "",
  });

  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.rating < 1) newErrors.rating = "Please select a rating";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.text.trim()) newErrors.text = "Review text is required";
    if (formData.text.trim().length < 10)
      newErrors.text = "Review must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ rating: 5, title: "", text: "" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 mb-8"
    >
      <h3 className="text-2xl font-bold mb-6">Share Your Experience</h3>
      {serviceName && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Reviewing: <span className="font-semibold">{serviceName}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-3">Rating *</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: value })}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      value <= (hoveredRating || formData.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-lg font-bold">{formData.rating}/5</span>
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-2">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Review Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Summarize your experience in a few words"
            maxLength="100"
            className={`input w-full ${errors.title ? "border-red-500" : ""}`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Your Review *
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Share your detailed feedback. What did you like or dislike? How was the experience?"
            rows="5"
            maxLength="500"
            className={`input w-full resize-none ${errors.text ? "border-red-500" : ""}`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.text && (
              <p className="text-red-500 text-sm">{errors.text}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.text.length}/500 characters
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary py-3"
        >
          {isLoading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
