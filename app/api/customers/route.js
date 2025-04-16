import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminCache, cacheAdminResponse, clearAdminCache } from "@/lib/utils";

// The same guest email used in the orders API
const GUEST_USER_EMAIL = "guest-orders@system.internal";

export async function GET(request) {
  try {
    // Check if we have a cached version of the customers
    const cachedCustomers = getAdminCache("customers");
    if (cachedCustomers) {
      return NextResponse.json(cachedCustomers);
    }
    
    // Fetch only registered users with CLIENT role and exclude the guest user
    const customers = await prisma.user.findMany({
      where: {
        role: "CLIENT",
        email: {
          not: GUEST_USER_EMAIL // Exclude the guest user account
        }
      },
      include: {
        orders: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the data for the frontend
    const formattedCustomers = customers.map(customer => {
      const totalOrders = customer.orders.length;
      const lastOrderDate = totalOrders > 0 
        ? customer.orders[0].createdAt.toISOString().split('T')[0] 
        : null;
      
      // Format order history
      const orderHistory = customer.orders.map(order => ({
        id: order.id,
        date: order.createdAt.toISOString().split('T')[0],
        total: order.totalAmount,
        status: order.status
      }));

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalOrders,
        lastOrderDate,
        orderHistory,
        createdAt: customer.createdAt
      };
    });
    
    // Cache the formatted customers data
    cacheAdminResponse("customers", formattedCustomers);

    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Error fetching customers: " + error.message },
      { status: 500 }
    );
  }
}