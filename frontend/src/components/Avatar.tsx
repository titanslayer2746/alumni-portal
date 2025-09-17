import React, { useState } from "react";
import { User } from "lucide-react";
import {
  getProxiedImageUrl,
  generateFallbackAvatar,
} from "../utils/imageUtils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showFallbackIcon?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-32 h-32",
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 28,
  xl: 48,
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  className = "",
  showFallbackIcon = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // Get the appropriate image URL
  const getImageUrl = () => {
    if (!src || imageError) {
      return generateFallbackAvatar(
        name,
        size === "xl" ? 128 : size === "lg" ? 64 : size === "md" ? 40 : 32
      );
    }
    return getProxiedImageUrl(src);
  };

  const baseClasses = `${sizeClasses[size]} bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center overflow-hidden relative ${className}`;

  return (
    <div className={baseClasses}>
      {src && !imageError ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-1/2 w-1/2 border-b-2 border-white"></div>
            </div>
          )}
          <img
            src={getImageUrl()}
            alt={name}
            className={`w-full h-full object-cover ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </>
      ) : (
        // Fallback: either generated avatar or icon
        <>
          {showFallbackIcon && !src ? (
            <User size={iconSizes[size]} className="text-white" />
          ) : (
            <img
              src={getImageUrl()}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </>
      )}
    </div>
  );
};

export default Avatar;
