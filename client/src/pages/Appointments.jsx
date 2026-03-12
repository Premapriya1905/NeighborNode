import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, ChevronDown } from "lucide-react";
import { BookingCard } from "../components/bookings";
import useBookings from "../hooks/useBookings";
import { BOOKING_STATUS } from "../utils/constants";

const Appointments = () => {
    const { bookings, loading, error, filters, setFilters, fetchBookings } =
        useBookings(true); // Pass true to fetch appointments as a provider
    const [showStatusFilter, setShowStatusFilter] = useState(false);

    const statusOptions = [
        { label: "All", value: null },
        { label: "Pending", value: BOOKING_STATUS.PENDING },
        { label: "Accepted", value: BOOKING_STATUS.ACCEPTED },
        { label: "Completed", value: BOOKING_STATUS.COMPLETED },
        { label: "Rejected", value: BOOKING_STATUS.REJECTED },
        { label: "Cancelled", value: BOOKING_STATUS.CANCELLED },
    ];

    const filteredBookings = filters.status
        ? bookings.filter((b) => b.status === filters.status)
        : bookings;

    const upcomingBookings = filteredBookings.filter(
        (b) => new Date(b.scheduledDate) > new Date(),
    );
    const pastBookings = filteredBookings.filter(
        (b) => new Date(b.scheduledDate) <= new Date(),
    );

    if (error) {
        return (
            <div className="min-h-screen pt-24 pb-12">
                <div className="container-custom">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-slate-50 dark:from-slate-900">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold mb-2">Appointments</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your incoming service requests and upcoming appointments
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusFilter(!showStatusFilter)}
                            className="flex items-center gap-2 px-4 py-2 glass-strong rounded-lg hover:shadow-soft transition-shadow"
                        >
                            <Filter className="w-4 h-4" />
                            <span>
                                {filters.status
                                    ? statusOptions.find((o) => o.value === filters.status)?.label
                                    : "All Status"}
                            </span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showStatusFilter && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 mt-2 w-40 glass-strong rounded-lg shadow-soft-lg z-10"
                            >
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setFilters({ ...filters, status: option.value });
                                            setShowStatusFilter(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 transition-colors ${filters.status === option.value
                                                ? "bg-primary-600 text-white"
                                                : "hover:bg-gray-100 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    <button
                        onClick={fetchBookings}
                        className="px-4 py-2 glass-strong rounded-lg hover:shadow-soft transition-shadow text-sm"
                    >
                        Refresh
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-64 glass-strong rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="inline-block p-4 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4">
                            <svg
                                className="w-8 h-8 text-primary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {filters.status
                                ? "No appointments found with this status"
                                : "You haven't received any service requests yet"}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {/* Upcoming Bookings */}
                        {upcomingBookings.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full" />
                                    Upcoming Requests
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {upcomingBookings.map((booking, index) => (
                                        <motion.div
                                            key={booking._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <BookingCard
                                                booking={booking}
                                                onStatusChange={fetchBookings}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Bookings */}
                        {pastBookings.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gray-400 rounded-full" />
                                    Past Requests
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {pastBookings.map((booking, index) => (
                                        <motion.div
                                            key={booking._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <BookingCard
                                                booking={booking}
                                                onStatusChange={fetchBookings}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
