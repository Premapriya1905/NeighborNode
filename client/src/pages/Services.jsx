import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ServiceGrid, ServiceFilters } from "../components/services";
import useServices from "../hooks/useServices";
import toast from "react-hot-toast";

const Services = () => {
  const { services = [], isLoading, error, fetchServices } = useServices();
  const location = useLocation();

  const [filters, setFilters] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialCategory = searchParams.get('category') || "";
    // optionally handle search param if you want:
    const initialSearch = searchParams.get('search') || "";
    return {
      category: initialCategory,
      maxPrice: 500,
      search: initialSearch,
      sortBy: "newest",
    };
  });

  const loadServices = useCallback(async () => {
    try {
      await fetchServices(filters);
    } catch (err) {
      console.error("Failed to load services:", err);
      toast.error("Failed to load services");
    }
  }, [filters, fetchServices]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-8 pb-12"
    >
      <div className="container-custom max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-display font-bold mb-3">
            Browse Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find skilled professionals in your neighborhood
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-6 mb-8 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"
          >
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={loadServices}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <ServiceFilters
                onFilterChange={handleFilterChange}
                filters={filters}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <ServiceGrid
              services={services}
              isLoading={isLoading}
              servicesCount={services.length}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Services;