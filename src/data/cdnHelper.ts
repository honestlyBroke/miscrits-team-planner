/**
 * CDN utilities for loading Miscrit avatars and images
 * Based on http_service.gd from the decompiled game
 */

const CDN_URL = "https://cdn.worldofmiscrits.com";

/**
 * Generate CDN avatar URL for a miscrit
 * @param {string} name - First evolution name of the miscrit (e.g., "Flue")
 * @returns {string} Full CDN URL for the avatar image
 */
export function getAvatarUrl(name: string): string {
  if (!name) return "";
  
  // Sanitize: remove apostrophes, replace spaces with underscores, lowercase
  const sanitized = name
    .replace(/'/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
  
  return `${CDN_URL}/avatars/${sanitized}_avatar.png`;
}

/**
 * Generate CDN back/front image URL for a miscrit
 * @param {string} name - First evolution name of the miscrit
 * @param {string} type - "back" or other type suffix
 * @returns {string} Full CDN URL for the image
 */
export function getCdnImageUrl(name: string, type: string = "back"): string {
  if (!name) return "";
  
  const sanitized = name
    .replace(/'/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
  
  return `${CDN_URL}/miscrits/${sanitized}_${type}.png`;
}
