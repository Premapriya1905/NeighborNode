export const Skeleton = ({ className = '', ...props }) => {
    return (
      <div className={`skeleton ${className}`} {...props} />
    );
  };