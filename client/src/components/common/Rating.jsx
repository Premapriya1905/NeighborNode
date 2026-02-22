import { Star } from 'lucide-react';
  
  export const Rating = ({ value = 0, max = 5, showValue = true, size = 'md' }) => {
    const sizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
  
    return (
      <div className="flex items-center gap-1">
        {[...Array(max)].map((_, i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${
              i < Math.floor(value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        {showValue && (
          <span className="ml-1 text-sm font-medium">{value.toFixed(1)}</span>
        )}
      </div>
    );
  };