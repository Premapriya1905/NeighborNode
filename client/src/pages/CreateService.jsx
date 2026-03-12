import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ServiceForm } from "../components/services";
import useServices from "../hooks/useServices";
import toast from "react-hot-toast";
import api from "../services/api";

const CreateService = () => {
  const navigate = useNavigate();
  const { isLoading } = useServices();
  const { user } = useAuth();

  const handleCreateService = async (formData) => {
    try {
      const payload = {
        description: formData.description,
        category: formData.category,
        subcategory: formData.subCategory,

        pricing: {
          type: formData.pricing.type,
          amount:
            formData.pricing.type === "FREE"
              ? 0
              : Number(formData.pricing.amount),
        },

        availability: formData.availability,

        location: {
          buildingName: user?.location?.buildingName || "Default Building",
          street: user?.location?.street || "Default Street",
          city: user?.location?.city || "Default City",
          serviceArea: "Same building",
        },

        tags: formData.tags || [],
        features: formData.features || [],
      };

      const response = await api.post("/services", payload);
      const serviceId = response.data.data?._id || response.data._id;

      // Upload images if any exist
      if (formData.images && formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach(image => {
          imageFormData.append('images', image);
        });

        await api.post(`/services/${serviceId}/images`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success("Service created successfully!");
      navigate(`/services/${serviceId}`);
    } catch (err) {
      console.error("FRONTEND ERROR:", err);
      toast.error(err.message || "Failed to create service");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-8 pb-12"
    >
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">
            Post a New Service
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ServiceForm onSubmit={handleCreateService} isLoading={isLoading} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateService;