export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };
  
  export const truncate = (str, length = 100) => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  };