import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { SERVICE_CATEGORIES_MAP } from "../../utils/categories";

const ServiceForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState(
    initialData || {
      description: "",
      category: "",
      subCategory: "",
      pricing: {
        amount: "",
        type: "hourly", // 'hourly', 'monthly', or 'yearly'
      },
      availability: {
        days: [],
        startTime: "",
        endTime: "",
      },
      images: [],
      previewUrls: [],
    },
  );

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePricingChange = (field, value) => {
    setFormData({
      ...formData,
      pricing: {
        ...formData.pricing,
        [field]: value,
      },
    });
  };

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category: e.target.value,
      subCategory: "", // reset sub-category when category changes
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...(formData.images || []), ...files];
    const previewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setFormData({
      ...formData,
      images: newFiles,
      previewUrls,
    });
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPreviews = formData.previewUrls.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      images: updatedImages,
      previewUrls: updatedPreviews,
    });
  };

  const toggleDay = (day) => {
    const days = formData.availability.days.includes(day)
      ? formData.availability.days.filter((d) => d !== day)
      : [...formData.availability.days, day];

    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        days,
      },
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.subCategory) newErrors.subCategory = "Sub-category is required";
    if (!formData.pricing.amount) newErrors.price = "Price is required";
    
    if (formData.availability.days.length === 0) {
      newErrors.availability = "Please select at least one available day";
    }
    
    if (!formData.availability.startTime || !formData.availability.endTime) {
      newErrors.time = "Both start and end time are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Category */}
      <div>
        <label className="block text-sm font-semibold mb-2">Category *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleCategoryChange}
          className={`input w-full ${errors.category ? "border-red-500" : ""}`}
        >
          <option value="">Select a category</option>
          {Object.keys(SERVICE_CATEGORIES_MAP).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
        )}
      </div>

      {/* Sub Category */}
      <div>
        <label className="block text-sm font-semibold mb-2">Sub-Category *</label>
        <div 
          onClickCapture={() => {
            if (!formData.category) {
              toast.error("Please choose a category first before selecting a sub-category.");
            }
          }}
        >
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            className={`input w-full ${errors.subCategory ? "border-red-500" : ""}`}
            style={{ pointerEvents: !formData.category ? "none" : "auto", backgroundColor: !formData.category ? "#f3f4f6" : undefined }}
            tabIndex={!formData.category ? -1 : 0}
            readOnly={!formData.category}
          >
            <option value="">Select a sub-category</option>
            {formData.category && SERVICE_CATEGORIES_MAP[formData.category] && (
              SERVICE_CATEGORIES_MAP[formData.category].map((subCat) => (
                <option key={subCat} value={subCat}>
                  {subCat}
                </option>
              ))
            )}
          </select>
        </div>
        {errors.subCategory && (
          <p className="text-red-500 text-sm mt-1">{errors.subCategory}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your service in detail..."
          rows="5"
          className={`input w-full ${errors.description ? "border-red-500" : ""}`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Price *</label>
          <input
            type="number"
            value={formData.pricing.amount}
            onChange={(e) => handlePricingChange("amount", e.target.value)}
            placeholder="0"
            className={`input w-full ${errors.price ? "border-red-500" : ""}`}
            min="0"
            step="0.01"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Price Type</label>
          <select
            value={formData.pricing.type}
            onChange={(e) => handlePricingChange("type", e.target.value)}
            className="input w-full"
          >
            <option value="hourly">Per Hour</option>
            <option value="monthly">Per Month</option>
            <option value="yearly">Per Year</option>
          </select>
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Available Days *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${formData.availability.days.includes(day)
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        {errors.availability && (
          <p className="text-red-500 text-sm mt-1">{errors.availability}</p>
        )}
      </div>

      {/* Time Availability */}
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Start Time *</label>
            <input
              type="time"
              value={formData.availability.startTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  availability: {
                    ...formData.availability,
                    startTime: e.target.value,
                  },
                })
              }
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">End Time *</label>
            <input
              type="time"
              value={formData.availability.endTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  availability: {
                    ...formData.availability,
                    endTime: e.target.value,
                  },
                })
              }
              className="input w-full"
            />
          </div>
        </div>
        {errors.time && (
          <p className="text-red-500 text-sm mt-1">{errors.time}</p>
        )}
      </div>

      {/* Images Upload */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Service Images (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-primary-600 transition-colors cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="imageInput"
          />
          <label htmlFor="imageInput" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">
              Click to upload images or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </label>
        </div>

        {errors.images && (
          <p className="text-red-500 text-sm mt-1">{errors.images}</p>
        )}

        {/* Image Previews */}
        {formData.previewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn btn-primary py-3 text-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating...
          </div>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            {initialData ? "Update Service" : "Create Service"}
          </>
        )}
      </button>
    </motion.form>
  );
};

export default ServiceForm;
