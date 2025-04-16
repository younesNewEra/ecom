import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Memory cache store
const memoryCache = new Map();

// Cache utility for API responses
export function cacheResponse(key, data, ttl = 60000) { // Default TTL: 1 minute
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttl
  });
  return data;
}

export function getCachedResponse(key) {
  if (!memoryCache.has(key)) {
    return null;
  }
  
  const cached = memoryCache.get(key);
  
  // Check if cache has expired
  if (cached.expiry < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function clearCache(keyPattern = null) {
  if (keyPattern) {
    // Clear specific cache entries matching pattern
    for (const key of memoryCache.keys()) {
      if (key.includes(keyPattern)) {
        memoryCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    memoryCache.clear();
  }
}

// Admin-specific cache utilities
const ADMIN_CACHE_TTL = 300000; // 5 minutes default cache time for admin data

export function cacheAdminResponse(endpoint, data, ttl = ADMIN_CACHE_TTL) {
  const key = `admin:${endpoint}`;
  return cacheResponse(key, data, ttl);
}

export function getAdminCache(endpoint) {
  const key = `admin:${endpoint}`;
  return getCachedResponse(key);
}

export function clearAdminCache(endpoint = null) {
  const pattern = endpoint ? `admin:${endpoint}` : 'admin:';
  clearCache(pattern);
}
