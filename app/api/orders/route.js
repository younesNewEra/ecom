import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// Guest user ID constant - will be created if it doesn't exist
const GUEST_USER_EMAIL = "guest-orders@system.internal";

// Function to get or create a guest user account for non-registered users
async function getGuestUserAccount() {
  try {
    // Try to find the guest user account
    let guestUser = await prisma.user.findUnique({
      where: { email: GUEST_USER_EMAIL }
    });
    
    // If it doesn't exist, create it
    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          name: "Guest Customer",
          email: GUEST_USER_EMAIL,
          password: "GUEST_ACCOUNT_DO_NOT_USE",
          role: "CLIENT"
        }
      });
    }
    
    return guestUser.id;
  } catch (error) {
    console.error("Error getting guest account:", error);
    throw new Error("Failed to process guest order");
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { 
      shippingAddress, 
      paymentMethod, 
      userId, 
      items: directItems, 
      customerInfo 
    } = data;
    
    // Make shipping address and payment method optional
    const finalShippingAddress = shippingAddress || "Not specified";
    const finalPaymentMethod = paymentMethod || "Cash on delivery";
    
    let items = directItems;
    
    // If no direct items provided, use cart items from cookies
    if (!items || items.length === 0) {
      const cartItems = JSON.parse(cookies().get("cartItems")?.value || "[]");
      
      if (cartItems.length === 0) {
        return NextResponse.json(
          { error: "No items in cart" },
          { status: 400 }
        );
      }
      
      items = cartItems;
    }
    
    // Calculate total amount
    let totalAmount = 0;
    
    // Verify product availability and calculate total
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.name}`);
        }
        
        // Include item price in total
        totalAmount += product.price * item.quantity;
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          colorId: item.colorId || null,
          sizeId: item.sizeId || null,
        };
      })
    );
    
    // Determine user ID for the order
    let actualUserId = userId;
    
    // Check if this is a guest checkout (no userId provided)
    if (!actualUserId) {
      // Check if we have customer info for guest checkout
      if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
        return NextResponse.json(
          { error: "Customer name and phone are required for guest checkout" },
          { status: 400 }
        );
      }
      
      // Check if customer email exists in our users table
      if (customerInfo.email && customerInfo.email !== GUEST_USER_EMAIL) {
        const existingUser = await prisma.user.findUnique({
          where: { email: customerInfo.email },
        });
        
        if (existingUser) {
          // If user already exists, use their ID 
          actualUserId = existingUser.id;
        } else {
          // This is a guest order - use the guest user account 
          actualUserId = await getGuestUserAccount();
        }
      } else {
        // No email or system email - use guest account
        actualUserId = await getGuestUserAccount();
      }
      
      // Store guest customer info in shipping address
      let shippingInfo = finalShippingAddress;
      if (customerInfo) {
        shippingInfo = `GUEST ORDER - Name: ${customerInfo.name}, `;
        if (customerInfo.email) shippingInfo += `Email: ${customerInfo.email}, `;
        if (customerInfo.phone) shippingInfo += `Phone: ${customerInfo.phone}, `;
        shippingInfo += `Address: ${finalShippingAddress}`;
      }
      
      // Create order in database
      const order = await prisma.order.create({
        data: {
          userId: actualUserId,
          status: 'PENDING',
          totalAmount,
          shippingAddress: shippingInfo,
          paymentMethod: finalPaymentMethod,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      
      // Update product stock
      await Promise.all(
        orderItems.map(async (item) => {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        })
      );
      
      // Clear cart after successful order
      if (!directItems) {
        cookies().set("cartItems", "[]", {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        order: {
          id: order.id,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt
        }
      });
    } else {
      // Regular user checkout with existing userId
      const order = await prisma.order.create({
        data: {
          userId: actualUserId,
          status: 'PENDING',
          totalAmount,
          shippingAddress: finalShippingAddress,
          paymentMethod: finalPaymentMethod,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      
      // Update product stock
      await Promise.all(
        orderItems.map(async (item) => {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        })
      );
      
      // Clear cart after successful order
      if (!directItems) {
        cookies().set("cartItems", "[]", {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        order: {
          id: order.id,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt
        }
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// Get all orders (for admin)
export async function GET(request) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}