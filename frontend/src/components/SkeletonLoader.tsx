import React from "react";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = "",
  count = 1,
  height = "h-4",
  width = "w-full",
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`skeleton rounded-lg ${height} ${width} ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        />
      ))}
    </>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card-3d p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader height="h-4" width="w-3/4" />
          <SkeletonLoader height="h-3" width="w-1/2" />
        </div>
      </div>
      <SkeletonLoader height="h-4" width="w-full" />
      <SkeletonLoader height="h-4" width="w-5/6" />
      <div className="flex space-x-2">
        <SkeletonLoader height="h-6" width="w-20" />
        <SkeletonLoader height="h-6" width="w-16" />
      </div>
    </div>
  );
};

export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="card-3d p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <SkeletonLoader height="h-5" width="w-2/3" />
          <SkeletonLoader height="h-4" width="w-1/3" />
        </div>
        <div className="skeleton w-8 h-8 rounded" />
      </div>
      <SkeletonLoader height="h-4" width="w-full" />
      <SkeletonLoader height="h-4" width="w-4/5" />
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <SkeletonLoader height="h-6" width="w-16" />
          <SkeletonLoader height="h-6" width="w-20" />
        </div>
        <SkeletonLoader height="h-8" width="w-24" />
      </div>
    </div>
  );
};

export default SkeletonLoader;
