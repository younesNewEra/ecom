// Cart utility functions for client-side usage

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
    
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Get cart items
export async function getCartItems() {
  try {
    const response = await fetch('/api/cart');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch cart');
    }
    
    return data.items;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
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