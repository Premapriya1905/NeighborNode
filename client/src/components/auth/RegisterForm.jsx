import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    buildingName: "",
    street: "",
    apartmentNumber: "",
    city: "",
    zipCode: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (
      formData.firstName.trim().length < 2 ||
      formData.firstName.trim().length > 50
    ) {
      newErrors.firstName = "First name must be between 2 and 50 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (
      formData.lastName.trim().length < 2 ||
      formData.lastName.trim().length > 50
    ) {
      newErrors.lastName = "Last name must be between 2 and 50 characters";
    }

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format (must contain '@' and domain)";

    if (!formData.buildingName.trim())
      newErrors.buildingName = "Building name is required";

    if (!formData.street.trim()) newErrors.street = "Street is required";

    if (!formData.city.trim()) newErrors.city = "City is required";

    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        location: {
          buildingName: formData.buildingName.trim(),
          street: formData.street.trim(),
          apartmentNumber: formData.apartmentNumber.trim(),
          city: formData.city.trim(),
          zipCode: formData.zipCode.trim(),
        },
      });

      console.log("REGISTER RESPONSE:", response);

      if (response?.accessToken) {
        navigate("/dashboard");
      } else {
        setErrors({
          general: response?.message || "Registration failed",
        });
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-display font-bold mb-2">
          Join NeighborNode
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create your account and start connecting with neighbors
        </p>
      </div>

      <div className="glass-strong rounded-2xl shadow-soft-lg p-8">
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First & Last Name */}
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              name="firstName"
              icon={<User />}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
            <InputField
              label="Last Name"
              name="lastName"
              icon={<User />}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
          </div>

          <InputField
            label="Email"
            name="email"
            type="email"
            icon={<Mail />}
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />

          {/* Location Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Building Name"
              name="buildingName"
              icon={<MapPin />}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
            <InputField
              label="Street"
              name="street"
              icon={<MapPin />}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Apartment Number"
              name="apartmentNumber"
              icon={<MapPin />}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
            <InputField
              label="City"
              name="city"
              icon={<MapPin />}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
          </div>

          <InputField
            label="Zip Code"
            name="zipCode"
            icon={<MapPin />}
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />

          {/* Passwords */}
          <div className="grid md:grid-cols-2 gap-6">
            <PasswordField
              label="Password"
              name="password"
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

/* Reusable Input Component */
const InputField = ({
  label,
  name,
  icon,
  formData,
  errors,
  handleChange,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`input pl-11 ${errors[name] ? "border-red-500" : ""}`}
      />
    </div>
    {errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
    )}
  </div>
);

/* Reusable Password Component */
const PasswordField = ({
  label,
  name,
  show,
  toggle,
  formData,
  errors,
  handleChange,
}) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type={show ? "text" : "password"}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`input pl-11 pr-11 ${errors[name] ? "border-red-500" : ""}`}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
    )}
  </div>
);

export default RegisterForm;
