import { motion } from "framer-motion";
import { TrendingUp, Award, MessageCircle, Heart } from "lucide-react";

const ProfileStats = ({ stats = {} }) => {
  const defaultStats = {
    servicesOffered: 0,
    totalEarnings: 0,
    bookingsCompleted: 0,
    averageRating: 0,
    totalReviews: 0,
    responseTime: "N/A",
    completionRate: 0,
    favoriteCount: 0,
  };

  const mergedStats = { ...defaultStats, ...stats };

  const statsCards = [
    {
      label: "Services Offered",
      value: mergedStats.servicesOffered,
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      suffix: "",
    },
    {
      label: "Bookings Completed",
      value: mergedStats.bookingsCompleted,
      icon: Award,
      color: "from-green-500 to-green-600",
      suffix: "",
    },
    {
      label: "Average Rating",
      value: mergedStats.averageRating.toFixed(1),
      icon: TrendingUp,
      color: "from-yellow-500 to-yellow-600",
      suffix: "⭐",
    },
    {
      label: "Total Reviews",
      value: mergedStats.totalReviews,
      icon: MessageCircle,
      color: "from-purple-500 to-purple-600",
      suffix: "",
    },
    {
      label: "Completion Rate",
      value: `${mergedStats.completionRate.toFixed(0)}%`,
      icon: Award,
      color: "from-pink-500 to-pink-600",
      suffix: "",
    },
    {
      label: "Times Favorited",
      value: mergedStats.favoriteCount,
      icon: Heart,
      color: "from-red-500 to-red-600",
      suffix: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-strong rounded-xl p-4 text-center hover:shadow-soft-lg transition-shadow"
          >
            <div
              className={`inline-block p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-3`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {stat.value}
              {stat.suffix}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProfileStats;
