import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-800 rounded-2xl p-6 shadow-md animate-pulse border border-gray-700"
        >
          <div className="w-16 h-16 bg-gray-700 rounded-full mb-4 mx-auto"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-3"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-10 bg-gray-700 rounded w-full mt-4"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
