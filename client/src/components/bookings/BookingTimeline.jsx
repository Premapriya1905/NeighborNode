import { BOOKING_STATUS } from "../../utils/constants";

const BookingTimeline = ({ booking }) => {
  const statusOrder = [
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.ACCEPTED,
    BOOKING_STATUS.COMPLETED,
  ];

  const statusLabels = {
    [BOOKING_STATUS.PENDING]: "Pending",
    [BOOKING_STATUS.ACCEPTED]: "Accepted",
    [BOOKING_STATUS.COMPLETED]: "Completed",
    [BOOKING_STATUS.REJECTED]: "Rejected",
    [BOOKING_STATUS.CANCELLED]: "Cancelled",
  };

  const statusColors = {
    [BOOKING_STATUS.PENDING]: "bg-yellow-400",
    [BOOKING_STATUS.ACCEPTED]: "bg-blue-400",
    [BOOKING_STATUS.COMPLETED]: "bg-green-400",
    [BOOKING_STATUS.REJECTED]: "bg-orange-400",
    [BOOKING_STATUS.CANCELLED]: "bg-red-400",
  };

  const getStatusIndex = (status) => {
    return statusOrder.indexOf(status);
  };

  const currentStatusIndex = Math.max(
    getStatusIndex(booking.status),
    booking.status === BOOKING_STATUS.REJECTED ||
      booking.status === BOOKING_STATUS.CANCELLED
      ? 1
      : -1,
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative w-full px-4 text-center">
        {/* Timeline Items */}
        {statusOrder.map((status, index) => {
          const isCompleted = index < currentStatusIndex;
          const isCurrent =
            index === currentStatusIndex &&
            booking.status !== BOOKING_STATUS.REJECTED &&
            booking.status !== BOOKING_STATUS.CANCELLED;
          const isDisabled =
            index > currentStatusIndex &&
            booking.status !== BOOKING_STATUS.REJECTED &&
            booking.status !== BOOKING_STATUS.CANCELLED;

          return (
            <div key={status} className="flex flex-col items-center flex-1 relative">
              {/* Line to Next Item */}
              {index < statusOrder.length - 1 && (
                <div
                  className="absolute top-4 left-1/2 w-full h-1"
                  style={{
                    backgroundColor: isCompleted
                      ? "rgb(34, 197, 94)"
                      : "rgb(209, 213, 219)",
                    zIndex: 0,
                  }}
                />
              )}

              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative z-10 ${isCompleted || isCurrent
                    ? `${statusColors[status]} text-white shadow-lg`
                    : "bg-gray-300 dark:bg-gray-600 text-gray-600"
                  }`}
              >
                {isCompleted && <span className="text-sm font-bold">✓</span>}
                {isCurrent && (
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
                {isDisabled && <span className="text-xs">-</span>}
              </div>

              {/* Label */}
              <span
                className={`text-xs mt-2 text-center font-medium transition-colors ${isCompleted || isCurrent
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                {statusLabels[status]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Alternative Status Indicator (for rejected/cancelled) */}
      {(booking.status === BOOKING_STATUS.REJECTED ||
        booking.status === BOOKING_STATUS.CANCELLED) && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {booking.status === BOOKING_STATUS.REJECTED
                ? "Booking Rejected"
                : "Booking Cancelled"}
            </p>
            {booking.cancellationReason && (
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Reason: {booking.cancellationReason}
              </p>
            )}
          </div>
        )}
    </div>
  );
};

export default BookingTimeline;
