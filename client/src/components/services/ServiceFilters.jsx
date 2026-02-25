import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronDown } from "lucide-react";
import { SERVICE_CATEGORIES } from "../../utils/constants";

const ServiceFilters = ({ onFilterChange, filters = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    search = "",
    category = "",
    maxPrice = 500,
    sortBy = "newest",
  } = filters;

  const handleSearch = (value) => {
    onFilterChange({ search: value });
  };

  const handleCategory = (selectedCategory) => {
    onFilterChange({
      category: selectedCategory === category ? "" : selectedCategory,
    });
  };

  const handleSort = (value) => {
    onFilterChange({ sortBy: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 mb-8"
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-col gap-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold mb-3">Category</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {SERVICE_CATEGORIES.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={category === item}
                  onChange={() => handleCategory(item)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Price Range
          </label>
          <input
            type="range"
            min="0"
            max="500"
            value={maxPrice}
            onChange={(e) =>
              onFilterChange({ maxPrice: parseInt(e.target.value) })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1">
            <span>$0</span>
            <span>${maxPrice}</span>
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold mb-3">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="input w-full"
          >
            <option value="newest">Newest</option>
            <option value="rating">Rating</option>
            <option value="price_low">Price (Low to High)</option>
            <option value="price_high">Price (High to Low)</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Mobile Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-3 glass rounded-lg"
        >
          <span className="font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""
              }`}
          />
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold mb-2">
                Max Price: ${maxPrice}
              </label>
              <input
                type="range"
                min="0"
                max="500"
                value={maxPrice}
                onChange={(e) =>
                  onFilterChange({
                    maxPrice: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ServiceFilters;