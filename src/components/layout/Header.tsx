
"use client";

import { Input } from "@/components/ui/input";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";

import { useAppContext } from "@/context/AppContext";
import CategoryFilter from "@/components/news/CategoryFilter";
import type { Category } from "@/lib/types";

interface HeaderProps {
  onSearch: (searchTerm: string) => void;
  categories?: Category[];
  selectedCategory?: Category | "All";
  onSelectCategory?: (category: Category | "All") => void;
}

export default function Header({ onSearch, categories = [], selectedCategory = "All", onSelectCategory }: HeaderProps) {
  const [inputValue, setInputValue] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isClient } = useAppContext();
  
  const appName = 'Clypio';
  const appSubtitle = 'Global Stories in a Snap';
  const searchPlaceholder = 'Search news...';

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(inputValue);
  };

  if (!isClient) {
    // Basic skeleton or minimal content for SSR to prevent hydration errors with dynamic text
    return (
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top section with logo and search */}
          <div className="py-4 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-3xl font-bold text-blue-600 mb-4 sm:mb-0 animate-pulse bg-gray-200 h-9 w-48 rounded-md"></div>
            <div className="w-full sm:w-auto max-w-md sm:max-w-xs relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
               <Input type="search" className="pl-10 pr-4 py-2 w-full rounded-md border bg-white text-gray-900" disabled />
            </div>
            <div className="w-10 h-10" />
          </div>
          
          {/* Category skeleton for SSR */}
          <div className="py-3 ">
            <div className="flex flex-wrap gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Single line with logo, categories, and search */}
        <div className="py-4 flex items-center justify-between">
          {/* App Name and Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full font-bold text-lg mr-3 shadow-lg">
              {appName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-black">{appName}</span>
              <span className="text-xs text-gray-500 -mt-0.5">{appSubtitle}</span>
            </div>
          </Link>
          
          {/* Category Names - Center */}
          {categories.length > 0 && onSelectCategory && (
            <div className="hidden md:flex items-center mx-8 flex-1 justify-center">
              <CategoryFilter 
                categories={categories} 
                selectedCategory={selectedCategory} 
                onSelectCategory={onSelectCategory} 
              />
            </div>
          )}
          
          {/* Search Bar - Right */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Desktop Search */}
            <form onSubmit={handleSubmit} className="hidden md:block max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md border bg-white text-black focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  aria-label={searchPlaceholder}
                />
              </div>
            </form>
            
            {/* Mobile Menu Button */}
            {categories.length > 0 && onSelectCategory && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-black" />
                ) : (
                  <Menu className="h-6 w-6 text-black" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={inputValue}
                onChange={handleInputChange}
                className="pl-10 pr-4 py-2 w-full rounded-md border bg-white text-black focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                aria-label={searchPlaceholder}
              />
            </div>
          </form>
        </div>
        
        {/* Mobile Category Menu */}
        {categories.length > 0 && onSelectCategory && isMobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2">
              {['All', ...categories].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onSelectCategory(category as Category | "All");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-md transition-colors ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-black font-semibold'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>
        )}
        
        {/* Breaking news ticker */}
        <div className="py-2 border-t border-gray-200 bg-red-50">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-red-600">BREAKING:</span>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-black">Major developments in Gaza conflict • International response continues • Humanitarian aid reaches affected areas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
