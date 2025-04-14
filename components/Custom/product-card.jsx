import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="group relative bg-white rounded-lg border overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={300}
            height={300}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-500">{product.category}</span>
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: product.colorHex }}
              title={product.color}
            ></span>
          </div>

          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="font-bold text-lg">{formatCurrency(product.price)}</p>
        </div>

        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <button className="w-full py-2 bg-white rounded-lg font-medium hover:bg-gray-100 transition-colors">
              View Product
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

