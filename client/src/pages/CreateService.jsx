import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ServiceForm } from "../components/services";
import useServices from "../hooks/useServices";
import toast from "react-hot-toast";
import api from "../services/api";

const CreateService = () => {
  const navigate = useNavigate();
  const { isLoading } = useServices();

  const handleCreateService = async (formData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,

        pricing: {
          type: formData.pricing.type,
          amount:
            formData.pricing.type === "FREE"
              ? 0
              : Number(formData.pricing.amount),
        },

        availability: formData.availability,

        location: {
          buildingName: formData.location.buildingName,
          street: formData.location.street,
          city: formData.location.city,
          serviceArea: formData.location.serviceArea,
        },

        tags: formData.tags || [],
        features: formData.features || [],
      };

      const response = await api.post("/services", payload);

      toast.success("Service created successfully!");
      navigate(`/services/${response.data._id}`);
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