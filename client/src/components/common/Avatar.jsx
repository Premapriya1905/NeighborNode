import { User } from "lucide-react";

export const Avatar = ({
  src,
  alt = "Avatar",
  size = "md",
  status = null,
  className = "",
}) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
    away: "bg-yellow-500",
  };

  return (
    <div className={`relative ${sizes[size]}`}>
      <div
        className={`${sizes[size]} bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center overflow-hidden`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <User className="w-1/2 h-1/2 text-white" />
        )}
      </div>
      {status && (
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`}
        />
      )}
    </div>
  );
};

export default Avatar;
