"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const toggleView = () => {
    setIsSignIn(!isSignIn)
    // Reset form fields when toggling
    setPassword("")
    if (!isSignIn) {
      setName("")
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle authentication logic here
    console.log(isSignIn ? "Signing in" : "Signing up", { email, password, name })
  }

  const isValidEmail = email.includes("@") && email.includes(".")
  const isValidPassword = password.length >= 8

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-3xl font-bold">Ecom</h1>
          </div>
          <div className="max-w-md">
            <blockquote className="text-2xl font-light italic">
              "The perfect blend of design and functionality for the modern web."
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
                <Image
                  src="/placeholder.svg"
                  alt="User"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Alex Morgan</p>
                <p className="text-sm opacity-80">Product Designer</p>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="h-2 w-8 rounded-full bg-white/50" />
            <div className="h-2 w-8 rounded-full bg-white" />
            <div className="h-2 w-8 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-gray-700/30 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 h-60 w-60 rounded-full bg-gray-500/30 blur-3xl" />
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 bg-white">
        <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6 px-4 py-12 sm:px-8">
          <div>
            <h2 className="text-3xl font-bold">{isSignIn ? "Welcome back" : "Create an account"}</h2>
            <p className="mt-2 text-gray-600">
              {isSignIn ? "Sign in to access your account" : "Sign up to get started with our platform"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignIn ? "signin" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {!isSignIn && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email</Label>
                  {email && (
                    <span className={cn("text-xs", isValidEmail ? "text-green-500" : "text-red-500")}>
                      {isValidEmail ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" /> Valid email
                        </span>
                      ) : (
                        "Invalid email"
                      )}
                    </span>
                  )}
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn("h-12", email && (isValidEmail ? "border-green-500" : "border-red-500"))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {password && (
                    <span className={cn("text-xs", isValidPassword ? "text-green-500" : "text-red-500")}>
                      {isValidPassword ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" /> Strong password
                        </span>
                      ) : (
                        "At least 8 characters"
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignIn ? "Enter your password" : "Create a password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={cn("h-12 pr-10", password && (isValidPassword ? "border-green-500" : "border-red-500"))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isSignIn && (
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-gray-900 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button type="submit" className="w-full h-12 bg-black hover:bg-gray-800 text-white">
                <span>{isSignIn ? "Sign In" : "Create Account"}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="text-center text-sm">
            <span className="text-gray-600">{isSignIn ? "Don't have an account?" : "Already have an account?"}</span>{" "}
            <button onClick={toggleView} className="font-medium text-gray-900 hover:underline">
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-gray-900 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-gray-900 hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  )
}

