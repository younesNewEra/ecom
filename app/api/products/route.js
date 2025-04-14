import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// GET all products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : undefined;
    const categories = searchParams.getAll('category');
    const colors = searchParams.getAll('color');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 12;
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Build filter conditions
    const where = {};
    
    // Text search in name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    
    // Category filter
    if (categories.length > 0) {
      where.categoryId = { in: categories };
    }
    
    // Color filter
    if (colors.length > 0) {
      where.colors = {
        some: {
          colorId: { in: colors }
        }
      };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const orderBy = {};
    orderBy[sort] = order.toLowerCase(); // 'asc' or 'desc'
    
    // Count total matching products for pagination
    const totalProducts = await prisma.product.count({ where });
    
    // Fetch products with pagination, filtering, and sorting
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
      orderBy,
      skip,
      take: limit,
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Fetching products failed" },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract data from formData
    const name = formData.get("name");
    const description = formData.get("description") || "";
    const categoryId = formData.get("categoryId");
    const price = parseFloat(formData.get("price") || formData.get("sellingPrice"));
    const costPrice = parseFloat(formData.get("costPrice") || formData.get("buyingPrice"));
    const stock = parseInt(formData.get("stock"));
    
    // Validations
    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }
    
    if (isNaN(price) || isNaN(costPrice) || isNaN(stock)) {
      return NextResponse.json(
        { error: "Price, cost price, and stock must be valid numbers" },
        { status: 400 }
      );
    }
    
    // Get image file
    const imageFile = formData.get("image");
    let imageUrl = "";
    
    if (imageFile) {
      try {
        // Ensure directory exists
        const publicDirPath = path.join(process.cwd(), "public", "product-images");
        await fs.mkdir(publicDirPath, { recursive: true });
        
        // Generate unique filename
        const uniqueFileName = `${Date.now()}-${imageFile.name}`;
        imageUrl = `/product-images/${uniqueFileName}`;
        
        // Save the file to public directory
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(path.join(process.cwd(), "public", imageUrl), buffer);
      } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }
    } else {
      // Set default image if no image provided
      imageUrl = "/product-images/default-product.jpg";
    }
    
    // Get selected colors and sizes
    let colorNames = [];
    let sizeNames = [];
    
    try {
      // Parse JSON strings for colors and sizes
      const colorsString = formData.get("colors");
      const sizesString = formData.get("sizes");
      
      if (colorsString) {
        colorNames = JSON.parse(colorsString);
      }
      
      if (sizesString) {
        sizeNames = JSON.parse(sizesString);
      }
    } catch (error) {
      console.error("Parsing colors/sizes error:", error);
      return NextResponse.json(
        { error: "Invalid color or size data format" },
        { status: 400 }
      );
    }
    
    // Create or get colors
    const colorConnections = [];
    for (const colorName of colorNames) {
      // Find or create the color
      let color = await prisma.color.findFirst({
        where: { name: { equals: colorName, mode: 'insensitive' } }
      });
      
      if (!color) {
        // Create a new color with a default hex value
        color = await prisma.color.create({
          data: {
            name: colorName,
            hexValue: "#000000" // Default hex value
          }
        });
      }
      
      colorConnections.push({
        color: {
          connect: { id: color.id }
        }
      });
    }
    
    // Create or get sizes
    const sizeConnections = [];
    for (const sizeName of sizeNames) {
      // Find or create the size
      let size = await prisma.size.findFirst({
        where: { name: { equals: sizeName, mode: 'insensitive' } }
      });
      
      if (!size) {
        // Create a new size
        size = await prisma.size.create({
          data: {
            name: sizeName
          }
        });
      }
      
      sizeConnections.push({
        size: {
          connect: { id: size.id }
        }
      });
    }
    
    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        categoryId,
        price,
        costPrice,
        imageUrl,
        stock,
        colors: { 
          create: colorConnections
        },
        sizes: { 
          create: sizeConnections
        },
      },
      include: {
        category: true,
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Product creation error:", err);
    return NextResponse.json(
      { error: "Product creation failed: " + err.message },
      { status: 500 }
    );
  }
}

// PUT to update a product
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Extract data from formData
    const name = formData.get("name");
    const description = formData.get("description") || "";
    const categoryId = formData.get("categoryId");
    const price = parseFloat(formData.get("price") || formData.get("sellingPrice"));
    const costPrice = parseFloat(formData.get("costPrice") || formData.get("buyingPrice"));
    const stock = parseInt(formData.get("stock"));
    
    // Prepare update data
    const updateData = {
      name,
      description,
      categoryId,
      stock,
    };
    
    // Only add price fields if they are valid numbers
    if (!isNaN(price)) updateData.price = price;
    if (!isNaN(costPrice)) updateData.costPrice = costPrice;
    
    // Get image file
    const imageFile = formData.get("image");
    
    if (imageFile && imageFile.name) {
      // Handle image upload similarly to POST
      try {
        // Ensure directory exists
        const publicDirPath = path.join(process.cwd(), "public", "product-images");
        await fs.mkdir(publicDirPath, { recursive: true });
        
        // Generate unique filename
        const uniqueFileName = `${Date.now()}-${imageFile.name}`;
        updateData.imageUrl = `/product-images/${uniqueFileName}`;
        
        // Save the file to public directory
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(path.join(process.cwd(), "public", updateData.imageUrl), buffer);
      } catch (error) {
        console.error("Image update error:", error);
        return NextResponse.json(
          { error: "Image update failed" },
          { status: 500 }
        );
      }
    }
    
    // Get selected colors and sizes if provided
    let colorNames = [];
    let sizeNames = [];
    
    try {
      // Parse JSON strings for colors and sizes if provided
      const colorsString = formData.get("colors");
      const sizesString = formData.get("sizes");
      
      if (colorsString) {
        colorNames = JSON.parse(colorsString);
      }
      
      if (sizesString) {
        sizeNames = JSON.parse(sizesString);
      }
    } catch (error) {
      console.error("Parsing colors/sizes error:", error);
    }
    
    // Only update colors and sizes if they were provided
    if (colorNames.length > 0 || sizeNames.length > 0) {
      // Update colors if provided
      if (colorNames.length > 0) {
        // Remove old colors first
        await prisma.productColor.deleteMany({ where: { productId: id } });
        
        // Add new colors
        for (const colorName of colorNames) {
          // Find or create the color
          let color = await prisma.color.findFirst({
            where: { name: { equals: colorName, mode: 'insensitive' } }
          });
          
          if (!color) {
            // Create a new color with a default hex value
            color = await prisma.color.create({
              data: {
                name: colorName,
                hexValue: "#000000" // Default hex value
              }
            });
          }
          
          // Connect color to product
          await prisma.productColor.create({
            data: {
              productId: id,
              colorId: color.id
            }
          });
        }
      }
      
      // Update sizes if provided
      if (sizeNames.length > 0) {
        // Remove old sizes first
        await prisma.productSize.deleteMany({ where: { productId: id } });
        
        // Add new sizes
        for (const sizeName of sizeNames) {
          // Find or create the size
          let size = await prisma.size.findFirst({
            where: { name: { equals: sizeName, mode: 'insensitive' } }
          });
          
          if (!size) {
            // Create a new size
            size = await prisma.size.create({
              data: {
                name: sizeName
              }
            });
          }
          
          // Connect size to product
          await prisma.productSize.create({
            data: {
              productId: id,
              sizeId: size.id
            }
          });
        }
      }
    }
    
    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Product update error:", err);
    return NextResponse.json(
      { error: "Product update failed: " + err.message },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Get the current product
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Delete the product image if it's not the default
    if (product.imageUrl && !product.imageUrl.includes('default-product.jpg')) {
      try {
        await fs.unlink(path.join(process.cwd(), "public", product.imageUrl));
      } catch (error) {
        console.error("Failed to delete product image:", error);
        // Continue with deletion even if image removal fails
      }
    }
    
    // Delete the product
    await prisma.product.delete({ where: { id } });
    
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Product deletion error:", err);
    return NextResponse.json(
      { error: "Product deletion failed: " + err.message },
      { status: 500 }
    );
  }
}
