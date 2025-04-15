import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// Get cart items
export async function GET() {
  try {
    const cartId = cookies().get("cartId")?.value;
    
    if (!cartId) {
      return NextResponse.json({ items: [] });
    }
    
    // Fetch cart items from the database or session storage
    const cartItems = JSON.parse(cookies().get("cartItems")?.value || "[]");
    
    // Fetch product details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await prisma.product.findUnique({
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
        
        return {
          ...item,
          product,
        };
      })
    );
    
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
    
    // Validate product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
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
                (!colorId || item.colorId === colorId) && 
                (!sizeId || item.sizeId === sizeId)
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
    
    return NextResponse.json({ success: true, cartId, itemCount: cartItems.length });
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
    
    // Get existing cart items
    const cartItems = JSON.parse(cookies().get("cartItems")?.value || "[]");
    
    // Find the item
    const itemIndex = cartItems.findIndex(
      (item) => item.productId === productId && 
                (!colorId || item.colorId === colorId) && 
                (!sizeId || item.sizeId === sizeId)
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }
    
    if (quantity === 0) {
      // Remove item if quantity is 0
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
    
    return NextResponse.json({ success: true, itemCount: cartItems.length });
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
    cookies().set("cartItems", "[]", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}