import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAdminCache, cacheAdminResponse, clearAdminCache } from "@/lib/utils";

const prisma = new PrismaClient();

// GET all categories
export async function GET() {
  try {
    // Check if we have a cached version of the categories
    const cachedCategories = getAdminCache("categories");
    if (cachedCategories) {
      return NextResponse.json(cachedCategories);
    }
    
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      productsCount: cat._count.products
    }));
    
    // Cache the categories data
    cacheAdminResponse("categories", formattedCategories);

    return NextResponse.json(formattedCategories);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(request) {
  try {
    const { name } = await request.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name }
    });

    return NextResponse.json(category);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT to update a category
export async function PUT(request) {
  try {
    const { id, name } = await request.json();
    
    if (!id || !name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category ID and name are required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        NOT: { id }
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name }
    });

    return NextResponse.json(category);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE a category
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if any products use this category
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${productsCount} associated products` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}