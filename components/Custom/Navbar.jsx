// components/layout/Navbar.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith('/admin');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 shadow-md backdrop-blur-sm py-4' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className={`text-xl font-bold ${scrolled ? 'text-black' : 'text-white'}`}>
            Ecom
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className={`transition-colors ${scrolled ? 'text-black hover:text-blue-500' : 'text-white hover:text-gray-200'}`}>
              Products
            </Link>
            <Link href="/categories" className={`transition-colors ${scrolled ? 'text-black hover:text-blue-500' : 'text-white hover:text-gray-200'}`}>
              Categories
            </Link>
            <Link href="/sale" className={`transition-colors ${scrolled ? 'text-black hover:text-blue-500' : 'text-white hover:text-gray-200'}`}>
              Sale
            </Link>
            <Link href="/about" className={`transition-colors ${scrolled ? 'text-black hover:text-blue-500' : 'text-white hover:text-gray-200'}`}>
              About
            </Link>
          </div>

          {/* Search, Cart, Account & Admin Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors ${
                scrolled 
                  ? 'hover:bg-gray-100 text-black' 
                  : 'hover:bg-white/10 text-white'
              }`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            <Link 
              href="/cart" 
              className={`p-2 rounded-full transition-colors relative ${
                scrolled 
                  ? 'hover:bg-gray-100 text-black' 
                  : 'hover:bg-white/10 text-white'
              }`}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                3
              </span>
            </Link>
            
            <Link 
              href="/account" 
              className={`p-2 rounded-full transition-colors ${
                scrolled 
                  ? 'hover:bg-gray-100 text-black' 
                  : 'hover:bg-white/10 text-white'
              }`}
              aria-label="Account"
            >
              <User size={20} />
            </Link>
            
            {!isAdminPage && (
              <Link 
                href="/admin" 
                className={`ml-2 px-4 py-2 rounded transition-colors ${
                  scrolled
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Mobile menu button - always visible in the same position */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 focus:outline-none z-50 ${
              scrolled 
                ? 'text-black' 
                : 'text-white'
            }`}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search bar - shown when search is clicked */}
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${searchOpen ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for products..." 
              className="w-full p-2 border rounded pl-10"
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={`
          fixed inset-0 bg-black z-40 pt-20 transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="container mx-auto px-6 py-4 flex flex-col">
          <Link 
            href="/products" 
            className="py-3 border-b border-gray-100 hover:text-blue-500 transition-colors"
          >
            Products
          </Link>
          <Link 
            href="/categories" 
            className="py-3 border-b border-gray-100 hover:text-blue-500 transition-colors"
          >
            Categories
          </Link>
          <Link 
            href="/sale" 
            className="py-3 border-b border-gray-100 hover:text-blue-500 transition-colors"
          >
            Sale
          </Link>
          <Link 
            href="/about" 
            className="py-3 border-b border-gray-100 hover:text-blue-500 transition-colors"
          >
            About
          </Link>
          
          <div className="flex justify-between items-center py-3">
            <div className="flex space-x-4">
              <Link 
                href="/cart" 
                className="relative"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  3
                </span>
              </Link>
              
              <Link 
                href="/account" 
                aria-label="Account"
              >
                <User size={20} />
              </Link>
            </div>
            
            {!isAdminPage && (
              <Link 
                href="/admin" 
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for products..." 
                className="w-full p-2 border rounded pl-10"
              />
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}