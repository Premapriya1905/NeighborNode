import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useBookings from "../hooks/useBookings";
import { BookingCard } from "../components/bookings";
import { BOOKING_STATUS } from "../utils/constants";

const Dashboard = () => {
  const { user } = useAuth();
  const { bookings, loading } = useBookings();

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length,
      icon: AlertCircle,
      color: "text-yellow-600",
    },
    {
      label: "Accepted",
      value: bookings.filter((b) => b.status === BOOKING_STATUS.ACCEPTED)
        .length,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED)
        .length,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  const upcomingBookings = bookings
    .filter(
      (b) =>
        new Date(b.scheduledDate) > new Date() &&
        b.status === BOOKING_STATUS.ACCEPTED,
    )
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
    .slice(0, 3);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-slate-50 dark:from-slate-900">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your bookings and activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-strong rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Link
            to="/create-service"
            className="glass-strong rounded-2xl p-6 hover:shadow-soft-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Create Service</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Offer a new service to neighbors
                </p>
              </div>
              <svg
                className="w-6 h-6 text-primary-600 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          <Link
            to="/bookings"
            className="glass-strong rounded-2xl p-6 hover:shadow-soft-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">View All Bookings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage all your bookings
                </p>
              </div>
              <svg
                className="w-6 h-6 text-primary-600 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* Upcoming Bookings */}
        {!loading && upcomingBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Bookings</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BookingCard booking={booking} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
