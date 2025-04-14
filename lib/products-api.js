/**
 * Utility functions for product API calls
 */

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
    
    // Fetch products from API
    const response = await fetch(`/api/products?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }
    
    return await response.json();
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
    const response = await fetch(`/api/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    throw error;
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