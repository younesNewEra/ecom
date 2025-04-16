import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { cacheResponse, getCachedResponse, clearCache } from "@/lib/utils";

const prisma = new PrismaClient();

// Get cart items
export async function GET() {
  try {
    const cartId = cookies().get("cartId")?.value;
    
    if (!cartId) {
      return NextResponse.json({ items: [] });
    }
    
    // Fetch cart items from cookie
    const cartItems = JSON.parse(cookies().get("cartItems")?.value || "[]");
    
    if (cartItems.length === 0) {
      return NextResponse.json({ items: [] });
    }
    
    // Create a cache key based on cart items - changing cart contents invalidates cache
    const cartContentHash = cartItems
      .map(item => `${item.productId}:${item.quantity}:${item.colorId || ''}:${item.sizeId || ''}`)
      .sort()
      .join('|');
    
    const cacheKey = `cart:${cartId}:${cartContentHash}`;
    
    // Try to get cached cart data
    const cachedCart = getCachedResponse(cacheKey);
    if (cachedCart) {
      return NextResponse.json({ items: cachedCart });
    }
    
    // If not cached, fetch product details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        // Try to get cached product
        const productCacheKey = `product:${item.productId}`;
        let product = getCachedResponse(productCacheKey);
        
        if (!product) {
          // If product not cached, fetch from database
          product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              colors: {
                include: {
                  color: true,
                },
              },
              sizes: {
                include: {
                  size: true,
                },
              },
            },
          });
          
          // Cache the product for 10 minutes
          if (product) {
            cacheResponse(productCacheKey, product, 600000);
          }
        }
        
        // Find color and size objects if IDs are provided
        let color = null;
        let size = null;
        
        if (item.colorId && product && product.colors) {
          const colorRelation = product.colors.find(c => c.colorId === item.colorId);
          color = colorRelation ? colorRelation.color : null;
        }
        
        if (item.sizeId && product && product.sizes) {
          const sizeRelation = product.sizes.find(s => s.sizeId === item.sizeId);
          size = sizeRelation ? sizeRelation.size : null;
        }
        
        return {
          ...item,
          product,
          color,
          size
        };
      })
    );
    
    // Cache the cart data for 5 minutes
    cacheResponse(cacheKey, itemsWithDetails, 300000);
    
    return NextResponse.json({ items: itemsWithDetails });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(request) {
  try {
    const data = await request.json();
    const { productId, quantity, colorId, sizeId } = data;
    
    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }
    
    // Try to get product from cache first
    const productCacheKey = `product:${productId}`;
    let product = getCachedResponse(productCacheKey);
    
    if (!product) {
      // Validate product exists and has enough stock
      product = await prisma.product.findUnique({
        where: { id: productId },
      });
      
      // Cache the product
      if (product) {
        cacheResponse(productCacheKey, product, 600000);
      }
    }
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }
    
    // Get or create a cart ID
    let cartId = cookies().get("cartId")?.value;
    if (!cartId) {
      cartId = Math.random().toString(36).substring(2, 15);
      cookies().set("cartId", cartId, { 
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }
    
    // Get existing cart items
    const cartItems = JSON.parse(cookies().get("cartItems")?.value || "[]");
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.productId === productId && 
                (item.colorId === colorId || (!item.colorId && !colorId)) && 
                (item.sizeId === sizeId || (!item.sizeId && !sizeId))
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cartItems.push({
        productId,
        quantity,
        colorId,
        sizeId,
        price: product.price,
        addedAt: new Date().toISOString(),
      });
    }
    
    // Save cart items in cookie
    cookies().set("cartItems", JSON.stringify(cartItems), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    // Clear cart cache since contents changed
    clearCache(`cart:${cartId}:`);
    
    // Return detailed item information to avoid need for additional API call
    const updatedItems = await Promise.all(
      cartItems.map(async (item) => {
        // Reuse cached product if available
        let itemProduct = item.productId === productId ? 
          product : 
          getCachedResponse(`product:${item.productId}`);
        
        // Fetch if not cached
        if (!itemProduct) {
          itemProduct = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              colors: {
                include: {
                  color: true,
                },
              },
              sizes: {
                include: {
                  size: true,
                },
              },
            },
          });
          
          if (itemProduct) {
            cacheResponse(`product:${item.productId}`, itemProduct, 600000);
          }
        }
        
        return {
          ...item,
          product: itemProduct,
        };
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      cartId, 
      itemCount: cartItems.length,
      items: updatedItems
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

// Update cart (update quantity or remove item)
export async function PUT(request) {
  try {
    const data = await request.json();
    const { productId, quantity, colorId, sizeId } = data;
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    const cartId = cookies().get("cartId")?.value;
    if (!cartId) {
      return NextResponse.json({ success: true, itemCount: 0, items: [] });
    }
    
    // Get existing cart items
    const cartItems = JSON.parse(cookies().get("cartItems")?.value || "[]");
    
    // Find the item
    const itemIndex = cartItems.findIndex(
      (item) => item.productId === productId && 
                (item.colorId === colorId || (!item.colorId && !colorId)) && 
                (item.sizeId === sizeId || (!item.sizeId && !sizeId))
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cartItems.splice(itemIndex, 1);
    } else {
      // Update quantity
      cartItems[itemIndex].quantity = quantity;
    }
    
    // Save updated cart
    cookies().set("cartItems", JSON.stringify(cartItems), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    // Clear cart cache since contents changed
    clearCache(`cart:${cartId}:`);
    
    // Return updated items information to avoid need for additional API call
    const updatedItems = await Promise.all(
      cartItems.map(async (item) => {
        // Try to get from cache first
        let product = getCachedResponse(`product:${item.productId}`);
        
        // Fetch if not cached
        if (!product) {
          product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              colors: {
                include: {
                  color: true,
                },
              },
              sizes: {
                include: {
                  size: true,
                },
              },
            },
          });
          
          if (product) {
            cacheResponse(`product:${item.productId}`, product, 600000);
          }
        }
        
        return {
          ...item,
          product,
        };
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      itemCount: cartItems.length,
      items: updatedItems 
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// Clear cart
export async function DELETE() {
  try {
    const cartId = cookies().get("cartId")?.value;
    
    cookies().set("cartItems", "[]", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    // Clear cart cache
    if (cartId) {
      clearCache(`cart:${cartId}:`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}