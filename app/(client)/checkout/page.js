"use client"

import { useState } from "react"
import Image from "next/image"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = useState("delivery")
  const [subtotal, setSubtotal] = useState(349.99)
  const [shipping, setShipping] = useState(15.0)
  const [tax, setTax] = useState(28.0)

  // Calculate total
  const total = subtotal + shipping + tax

  return (
    <div className="h-[100vh] min-h-screen bg-white pt-16">
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Information */}
          <div>
            <h2 className="text-xl font-bold mb-6">Checkout</h2>
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Shipping Information</h3>
              <RadioGroup defaultValue="delivery" className="flex gap-4 mb-6" onValueChange={setDeliveryMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup">Pick up</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm text-gray-500 mb-1 block">
                  Full name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  className="border border-gray-200 rounded-md h-10 focus:border-black focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm text-gray-500 mb-1 block">
                  Phone number *
                </Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  className="border border-gray-200 rounded-md h-10 focus:border-black focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-sm text-gray-500 mb-1 block">
                  State *
                </Label>
                <select
                  id="state"
                  className="w-full border border-gray-200 rounded-md h-10 px-3 focus:border-black focus:ring-0"
                >
                  <option value="">Select</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                </select>
              </div>

              <div>
                <Label htmlFor="commune" className="text-sm text-gray-500 mb-1 block">
                  Commune *
                </Label>
                <select
                  id="commune"
                  className="w-full border border-gray-200 rounded-md h-10 px-3 focus:border-black focus:ring-0"
                >
                  <option value="">Select</option>
                  <option value="commune1">Beverly Hills</option>
                  <option value="commune2">Santa Monica</option>
                  <option value="commune3">Pasadena</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">* Items marked with an asterisk are required</p>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Review your cart</h2>

            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="Scandinavian Sofa Premium"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">Scandinavian Sofa Premium</h3>
                  <p className="text-sm text-gray-500">Natural</p>
                  <p className="text-sm font-medium mt-1">${subtotal.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="Modern Coffee Table"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">Modern Coffee Table</h3>
                  <p className="text-sm text-gray-500">Black</p>
                  <p className="text-sm font-medium mt-1">$99.99</p>
                </div>
              </div>
            </div>

            <Separator className="my-4 bg-gray-200" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-4 bg-gray-200" />

            <div className="flex justify-between font-medium mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Button className="w-full bg-black hover:bg-gray-800 text-white h-12">Pay Now</Button>

            <div className="flex items-center gap-2 mt-4 justify-center">
              <Check className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Secure Checkout • SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
