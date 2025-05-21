/**
 * Utility functions for product API calls
 */
import { getCachedResponse, cacheResponse } from "@/lib/utils";

/**
 * Fetch all products with optional filtering parameters
 * @param {Object} options - Query options
 * @param {string} options.search - Search term
 * @param {number} options.minPrice - Minimum price
 * @param {number} options.maxPrice - Maximum price
 * @param {string[]} options.categories - Array of category IDs
 * @param {string[]} options.colors - Array of color IDs
 * @param {number} options.page - Page number
 * @param {number} options.limit - Products per page
 * @param {string} options.sort - Sort field
 * @param {string} options.order - Sort order (asc/desc)
 * @returns {Promise<Object>} Products data with pagination info
 */
export async function getProducts(options = {}) {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (options.search) params.append('search', options.search);
    if (options.minPrice) params.append('minPrice', options.minPrice.toString());
    if (options.maxPrice) params.append('maxPrice', options.maxPrice.toString());
    
    if (options.categories && options.categories.length) {
      options.categories.forEach(cat => params.append('category', cat));
    }
    
    if (options.colors && options.colors.length) {
      options.colors.forEach(color => params.append('color', color));
    }
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sort) params.append('sort', options.sort);
    if (options.order) params.append('order', options.order);
    
    const queryString = params.toString();
    const cacheKey = `products:list:${queryString}`;
    
    // Try to get from cache first
    const cachedData = getCachedResponse(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Fetch products from API
    const response = await fetch(`/api/products?${queryString}`, {
      next: { revalidate: 300 } // Cache for 5 minutes on the server side
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the response for 5 minutes
    cacheResponse(cacheKey, data, 300000);
    
    return data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

/**
 * Fetch a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product data
 */
export async function getProductById(id) {
  try {
    // Try to get from cache first
    const cacheKey = `product:${id}`;
    const cachedProduct = getCachedResponse(cacheKey);
    
    if (cachedProduct) {
      return cachedProduct;
    }

    // For server-side fetching, we need to use absolute URLs
    // The URL needs to be absolute when used in a server component
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    const apiUrl = `${baseUrl}/api/products/${id}`;
    
    // Use server cache for product data (Next.js fetch with revalidate)
    const response = await fetch(apiUrl, {
      next: { revalidate: 600 } // Cache for 10 minutes on the server side
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`);
    }
    
    const product = await response.json();
    
    // Cache the product data for 10 minutes in browser
    cacheResponse(cacheKey, product, 600000);
    
    // Preload and cache product images
    if (product.imageUrl) {
      preloadImage(product.imageUrl);
    }
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => preloadImage(img));
    }
    
    return product;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    throw error;
  }
}

/**
 * Helper function to preload images
 * @param {string} src - Image URL
 */
function preloadImage(src) {
  if (typeof window !== 'undefined') {
    const img = new Image();
    img.src = src;
  }
}

/**
 * Create a new product
 * @param {FormData} formData - Product form data
 * @returns {Promise<Object>} Created product
 */
export async function createProduct(formData) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create product');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

/**
 * Update an existing product
 * @param {string} id - Product ID
 * @param {FormData} formData - Updated product form data
 * @returns {Promise<Object>} Updated product
 */
export async function updateProduct(id, formData) {
  try {
    formData.append('id', id);
    
    const response = await fetch('/api/products', {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update product');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Response data
 */
export async function deleteProduct(id) {
  try {
    const response = await fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete product');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    throw error;
  }
}