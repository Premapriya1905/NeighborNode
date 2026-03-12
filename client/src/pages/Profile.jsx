import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  ProfileEdit,
  ProfileHeader,
  ProfileStats,
} from "../components/profile";
import { Tab } from "@headlessui/react";
import { ServiceCard } from "../components/services";
import { ReviewList } from "../components/reviews";
import toast from "react-hot-toast";
import api from "../services/api";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [userServices, setUserServices] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [user?._id]);

  const fetchUserData = async () => {
    if (!user?._id) return;

    setIsLoading(true);
    try {
      const [servicesRes, reviewsRes] = await Promise.all([
        api.get(`/services/provider/${user._id}`),
        api.get(`/reviews/user/${user._id}`),
      ]);

      setUserServices(servicesRes.data.data || []);
      setUserReviews(reviewsRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await api.patch("/users/profile", updatedData);
      updateUser(response.data.data);
      setIsEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-8 pb-12"
    >
      <div className="container-custom max-w-6xl">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          onEditClick={() => setIsEditMode(!isEditMode)}
          isEditMode={isEditMode}
        />

        {/* Edit Mode */}
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-8"
          >
            <ProfileEdit
              user={user}
              onSubmit={handleProfileUpdate}
              onCancel={() => setIsEditMode(false)}
            />
          </motion.div>
        )}

        {/* Profile Stats */}
        {!isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-8"
          >
            <ProfileStats
              servicesCount={userServices.length}
              reviewsCount={userReviews.length}
              rating={user.averageRating || 0}
              bookingsCount={user.totalBookings || 0}
            />
          </motion.div>
        )}

        {/* Tabs */}
        {!isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <Tab.Group>
              <Tab.List className="flex gap-2 mb-8 border-b border-gray-200 dark:border-slate-700 flex-wrap">
                <Tab
                  className={({ selected }) =>
                    `px-4 py-3 font-semibold border-b-2 transition-colors outline-none ${selected
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900"
                    }`
                  }
                >
                  My Services ({userServices.length})
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `px-4 py-3 font-semibold border-b-2 transition-colors outline-none ${selected
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900"
                    }`
                  }
                >
                  Reviews ({userReviews.length})
                </Tab>
              </Tab.List>

              <Tab.Panels>
                {/* Services Tab */}
                <Tab.Panel>
                  {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                  ) : userServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userServices.map((service, index) => (
                        <motion.div
                          key={service._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ServiceCard service={service} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You haven't posted any services yet
                      </p>
                    </div>
                  )}
                </Tab.Panel>

                {/* Reviews Tab */}
                <Tab.Panel>
                  {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                  ) : userReviews.length > 0 ? (
                    <ReviewList reviews={userReviews} canDelete={false} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">
                        No reviews yet
                      </p>
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
