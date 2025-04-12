import express from "express"
import prisma from "../lib/prisma.js"
import upload from "../middlewares/upload.js"

const router = express.Router()

// 🔹 Add Product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      price,
      costPrice,
      stock,
      sizes,
      colors,
    } = req.body

    const imageUrl = req.file ? req.file.path : ""

    const product = await prisma.product.create({
      data: {
        name,
        description,
        categoryId,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
        imageUrl,
        stock: parseInt(stock),
        sizes: JSON.parse(sizes).map((sizeId) => ({
          size: { connect: { id: sizeId } },
        })),
        colors: JSON.parse(colors).map((colorId) => ({
          color: { connect: { id: colorId } },
        })),
      },
      include: {
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
    })

    res.json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Product creation failed" })
  }
})

// 🔹 Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
    })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: "Fetching products failed" })
  }
})

// 🔹 Update Product
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params
  try {
    const {
      name,
      description,
      categoryId,
      price,
      costPrice,
      stock,
      sizes,
      colors,
    } = req.body

    const imageUrl = req.file ? req.file.path : undefined

    // Remove old sizes/colors first
    await prisma.productSize.deleteMany({ where: { productId: id } })
    await prisma.productColor.deleteMany({ where: { productId: id } })

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
        stock: parseInt(stock),
        ...(imageUrl && { imageUrl }),
        sizes: {
          create: JSON.parse(sizes).map((sizeId) => ({
            size: { connect: { id: sizeId } },
          })),
        },
        colors: {
          create: JSON.parse(colors).map((colorId) => ({
            color: { connect: { id: colorId } },
          })),
        },
      },
      include: {
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
    })

    res.json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Product update failed" })
  }
})

// 🔹 Delete Product
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    await prisma.product.delete({ where: { id } })
    res.json({ message: "Product deleted successfully" })
  } catch (err) {
    res.status(500).json({ error: "Product deletion failed" })
  }
})

export default router
