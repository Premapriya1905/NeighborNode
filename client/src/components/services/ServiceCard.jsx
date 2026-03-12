import { motion } from "framer-motion";
import { MapPin, DollarSign, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Avatar, Badge } from "../common";
import { formatCurrency } from "../../utils/formatters";

const ServiceCard = ({ service, onFavorite }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e) => {
    e.preventDefault();
    setIsFavorited(!isFavorited);
    onFavorite?.(service._id);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card-hover group relative overflow-hidden rounded-2xl"
    >
      <Link to={`/services/${service._id}`} className="block">
        {/* Image Container */}
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-t-2xl overflow-hidden relative">
          {service.images?.[0] ? (
            <img
              src={service.images[0]}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary-400">
              {service.category?.[0] || "📦"}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </button>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="primary">{service.category}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title and Provider */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">
              {service.subcategory || service.category}
            </h3>
          </div>

          {/* Provider Info */}
          {service.providerId && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-slate-700">
              <Avatar src={service.providerId.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {service.providerId.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {typeof service.providerId.location === "string"
                    ? service.providerId.location
                    : service.providerId.location?.street ||
                      service.providerId.location?.city ||
                      "Location not available"}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {service.description}
          </p>

          {/* Rating and Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(service.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">
                {(service.rating || 0).toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({service.reviewCount || 0})
              </span>
            </div>

            <div className="text-primary-600 font-bold text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(service.pricing?.amount || 0)}
              </div>
              <div className="text-xs text-gray-500">
                {service.pricing?.type === "hourly" ? "/hr" : "fixed"}
              </div>
            </div>
          </div>

          {/* Location */}
          {service.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-slate-700">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {service.location.street || service.location.area}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
