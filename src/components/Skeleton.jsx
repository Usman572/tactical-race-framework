import { motion } from "framer-motion";

const Skeleton = ({ className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`bg-slate-200 dark:bg-slate-800 rounded-md ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
