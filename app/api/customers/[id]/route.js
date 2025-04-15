import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const customerId = params.id;
    
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: customerId },
      include: { orders: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete all associated orders if there are any
    if (user.orders.length > 0) {
      await prisma.order.deleteMany({
        where: { userId: customerId }
      });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: customerId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Error deleting customer: " + error.message },
      { status: 500 }
    );
  }
}