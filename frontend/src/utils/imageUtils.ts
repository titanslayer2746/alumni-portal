const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Converts a LinkedIn image URL to use our proxy endpoint
 * This helps bypass CORS and ad-blocker issues
 */
export const getProxiedImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return "";

  // If it's already a proxied URL, return as is
  if (originalUrl.includes("/api/proxy/")) {
    return originalUrl;
  }

  // If it's a LinkedIn image URL, use the LinkedIn-specific proxy
  if (originalUrl.includes("media.licdn.com")) {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${API_BASE_URL}/api/proxy/linkedin-avatar/${encodedUrl}`;
  }

  // For other external images, use the generic proxy
  if (originalUrl.startsWith("http")) {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${API_BASE_URL}/api/proxy/image/${encodedUrl}`;
  }

  // Return the original URL if it's not external
  return originalUrl;
};

/**
 * Generates a fallback avatar URL using initials
 */
export const generateFallbackAvatar = (
  name: string,
  size: number = 100
): string => {
  if (!name) return "";

  // Use a service like UI Avatars for fallback
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&size=${size}&background=ec4899&color=ffffff&format=png&rounded=true`;
};

/**
 * Checks if an image URL is valid and accessible
 */
export const isImageAccessible = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors", // This prevents CORS errors but limits response info
    });
    return true; // If no error is thrown, assume it's accessible
  } catch (error) {
    console.warn("Image not accessible:", url, error);
    return false;
  }
};

/**
 * Hook for handling image loading with fallback
 */
export const useImageWithFallback = () => {
  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement>,
    fallbackUrl?: string,
    userName?: string
  ) => {
    const img = event.currentTarget;

    // If we already tried the fallback, don't try again to prevent infinite loop
    if (img.src.includes("ui-avatars.com")) {
      return;
    }

    // Try the provided fallback first
    if (fallbackUrl && !img.src.includes(fallbackUrl)) {
      img.src = fallbackUrl;
      return;
    }

    // Generate a fallback avatar if we have a user name
    if (userName) {
      img.src = generateFallbackAvatar(userName);
      return;
    }

    // Last resort: show a generic avatar
    img.src = generateFallbackAvatar("User");
  };

  return { handleImageError };
};

/**
 * Preloads an image and returns a promise
 */
export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};
