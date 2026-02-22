import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Calendar, Shield, Star } from "lucide-react";
import { Avatar } from "../common";
import { formatDate } from "../../utils/formatters";

const ProfileHeader = ({ user, stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-8 mb-8"
    >
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Profile Picture and Basic Info */}
        <div className="md:col-span-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <Avatar
              src={user?.avatar}
              size="xl"
              status={user?.status || "online"}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {user?.title || "Community Member"}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{user?.rating || 0}</span>
                <span className="text-gray-500">
                  ({stats?.totalReviews || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-4 text-sm uppercase text-gray-600 dark:text-gray-400">
            Contact
          </h3>
          <div className="space-y-3">
            {user?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-600" />
                <a
                  href={`mailto:${user.email}`}
                  className="text-sm hover:text-primary-600 transition-colors"
                >
                  {user.email}
                </a>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-600" />
                <a
                  href={`tel:${user.phone}`}
                  className="text-sm hover:text-primary-600 transition-colors"
                >
                  {user.phone}
                </a>
              </div>
            )}
            {user?.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary-600" />
                <span className="text-sm">
                  {typeof user.location === "string"
                    ? user.location
                    : `${user.location.street || ""}${user.location.buildingName ? ", " + user.location.buildingName : ""}${user.location.city ? ", " + user.location.city : ""}`}
                </span>
              </div>
            )}
            {user?.memberSince && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span className="text-sm">
                  Member since {formatDate(user.memberSince)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-4 text-sm uppercase text-gray-600 dark:text-gray-400">
            Verification
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield
                className={`w-4 h-4 ${user?.emailVerified ? "text-green-500" : "text-gray-400"}`}
              />
              <span className="text-sm">
                {user?.emailVerified ? "Email Verified" : "Email Not Verified"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield
                className={`w-4 h-4 ${user?.phoneVerified ? "text-green-500" : "text-gray-400"}`}
              />
              <span className="text-sm">
                {user?.phoneVerified ? "Phone Verified" : "Phone Not Verified"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield
                className={`w-4 h-4 ${user?.identityVerified ? "text-green-500" : "text-gray-400"}`}
              />
              <span className="text-sm">
                {user?.identityVerified
                  ? "Identity Verified"
                  : "Identity Not Verified"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
