import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}