// Cart utility functions for client-side usage

// Local cache for cart items to prevent unnecessary reloads
let localCartCache = null;
let lastCartFetch = 0;
const CACHE_DURATION = 15000; // 15 seconds cache duration

// Add item to cart
export async function addToCart(product, quantity = 1, colorId = null, sizeId = null) {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product.id,
        quantity,
        colorId,
        sizeId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add item to cart');
    }
    
    // Update local cache with the returned items if available
    if (data.items) {
      localCartCache = data.items;
      lastCartFetch = Date.now();
    } else {
      // Invalidate cache so next getCartItems will fetch fresh data
      invalidateCartCache();
    }
    
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Get cart items - with client-side caching to reduce API calls
export async function getCartItems(forceRefresh = false) {
  try {
    // Use cached data if available and not expired
    if (!forceRefresh && localCartCache && (Date.now() - lastCartFetch < CACHE_DURATION)) {
      return localCartCache;
    }
    
    const response = await fetch('/api/cart');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch cart');
    }
    
    // Update local cache
    localCartCache = data.items;
    lastCartFetch = Date.now();
    
    return data.items;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
}

// Invalidate the client-side cart cache
export function invalidateCartCache() {
  localCartCache = null;
  lastCartFetch = 0;
}

// Update cart item quantity
export async function updateCartItem(productId, quantity, colorId = null, sizeId = null) {
  try {
    const response = await fetch('/api/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        quantity,
        colorId,
        sizeId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update cart');
    }
    
    // Update local cache with the returned items if available
    if (data.items) {
      localCartCache = data.items;
      lastCartFetch = Date.now();
    } else {
      // Invalidate cache so next getCartItems will fetch fresh data
      invalidateCartCache();
    }
    
    return data;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

// Remove item from cart
export async function removeFromCart(productId, colorId = null, sizeId = null) {
  return updateCartItem(productId, 0, colorId, sizeId);
}

// Clear cart
export async function clearCart() {
  try {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to clear cart');
    }
    
    // Clear local cache
    invalidateCartCache();
    
    return data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// Create order from cart items
export async function createOrder(orderData) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create order');
    }
    
    // Clear cart cache after successful order
    invalidateCartCache();
    
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Create order directly from product (Buy Now)
export async function buyNow(product, quantity, colorId, sizeId, orderData) {
  try {
    // Include product details directly in the order
    const orderWithItems = {
      ...orderData,
      items: [
        {
          productId: product.id,
          quantity,
          colorId,
          sizeId,
          price: product.price,
        }
      ]
    };
    
    return createOrder(orderWithItems);
  } catch (error) {
    console.error('Error with buy now:', error);
    throw error;
  }
}