"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthPage() {
  const router = useRouter()
  const [isSignIn, setIsSignIn] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleView = () => {
    setIsSignIn(!isSignIn)
    // Reset form fields when toggling
    setPassword("")
    setError("")
    if (!isSignIn) {
      setName("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError("");
    setLoading(true);
  
    if (!email || !password || (!isSignIn && !name)) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
  
    try {
      const endpoint = isSignIn ? "/api/auth/login" : "/api/auth/signup";
      const body = isSignIn
        ? { email, password }
        : { name, email, password };
  
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }
  
      if (data.token) {
        // Store auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Create cookie for server-side authentication
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        
        // Redirect based on user role
        if (data.user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');  // Redirect to home for regular users
        }
      } else {
        // If we somehow don't get a token but request succeeded
        if (!isSignIn) {
          // Successfully registered but no auto-login
          setIsSignIn(true);
          setError("Registration successful. Please sign in.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err.message);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = email.includes("@") && email.includes(".")
  const isValidPassword = password.length >= 8

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative " style={{   backgroundImage: "url('./accountBg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center", }}>
        <h1 className="text-white text-3xl font-bold mt-16 ml-10">
          <Link href={'/'}>Ecom</Link>
        </h1>
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

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

              <Button 
                type="submit" 
                className="w-full h-12 bg-black hover:bg-gray-800 text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isSignIn ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
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

