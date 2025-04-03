"use client"
import Image from 'next/image'
import Link from 'next/link'
import { Package, Check, ArrowRight, TrendingUp } from 'lucide-react'

const FeaturedSection = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Pack Deal Card */}
        <Link href="/pack-deals" className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-lg">
          <div className="relative h-[400px] w-full">
            <Image
              src="/sample1.jpg"
              alt="Pack Deal"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              {/* Badge */}
              <div className="absolute top-6 left-6">
                <div className="bg-red-500 text-sm font-bold px-4 py-2 rounded-full text-white flex items-center gap-2">
                  <Package size={16} />
                  PREMIUM PACK
                </div>
              </div>

              {/* Content */}
              <div className="absolute inset-6 flex flex-col justify-end text-white">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Style Essentials Pack</h3>
                    <p className="text-gray-300">Complete your wardrobe</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">$199</div>
                    <div className="text-red-400 font-medium">Save $86</div>
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-2 mb-6 hidden sm:block">
                  <div className="flex items-center gap-2 text-gray-200">
                    <Check size={16} className="text-green-400" />
                    <span>Premium Black T-Shirt</span>
                    <span className="text-sm text-gray-400 ml-auto">$39.99</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-200">
                    <Check size={16} className="text-green-400" />
                    <span>Classic Blue Jeans</span>
                    <span className="text-sm text-gray-400 ml-auto">$89.99</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-200">
                    <Check size={16} className="text-green-400" />
                    <span>Canvas Sneakers</span>
                    <span className="text-sm text-gray-400 ml-auto">$109.99</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div>
                    <div className="text-gray-400">Total Value: <span className="line-through">$239.97</span></div>
                    <div className="text-sm text-gray-400">Limited time offer • Free shipping</div>
                  </div>
                  <button className="group/btn bg-white text-black px-6 py-3 rounded-full font-medium 
                                   hover:bg-black hover:text-white transition-colors inline-flex items-center gap-2">
                    GET PACK!
                    <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Popular Products Card */}
        <Link href="/popular" className="col-span-1 group relative overflow-hidden rounded-lg">
          <div className="relative h-[400px] w-full">
            <Image
              src="/sample2.jpg"
              alt="Popular Products"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <div className="bg-red-500 text-sm font-bold px-3 py-1 rounded-full mb-3 w-fit flex items-center gap-2">
                  <TrendingUp size={14} />
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-2">Best Sellers</h3>
                <p className="text-gray-300 mb-4">Discover what everyone loves</p>
                <button className="group/btn bg-white text-black px-6 py-3 rounded-full font-medium 
                                 hover:bg-black hover:text-white transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center">
                  SHOP NOW
                  <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </Link>

        {/* Sale Deals Card */}
        <Link href="/sale" className="col-span-1 group relative overflow-hidden rounded-lg">
          <div className="relative h-[400px] w-full">
            <Image
              src="/accesories1.jpg"
              alt="Summer sale"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <div className="bg-red-500 text-sm font-bold px-3 py-1 rounded-full mb-3 w-fit">
                  UP TO 50% OFF
                </div>
                <h3 className="text-2xl font-bold mb-2">Sale this summer</h3>
                <p className="text-gray-300 mb-4">Limited time offers</p>
                <button className="group/btn bg-white text-black px-6 py-3 rounded-full font-medium 
                                 hover:bg-black hover:text-white transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center">
                  VIEW ALL
                  <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default FeaturedSection 