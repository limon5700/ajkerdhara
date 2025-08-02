
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import ThemeLanguageSwitcher from "./ThemeLanguageSwitcher";
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
  const { getUIText, isClient } = useAppContext();
  const [appName, setAppName] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('');

  useEffect(() => {
    if (isClient) {
      setAppName(getUIText('appName'));
      setSearchPlaceholder(getUIText('searchPlaceholder'));
    }
  }, [isClient, getUIText]);

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
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
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
          

        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top section with logo and search */}
        <div className="py-4 flex flex-col sm:flex-row justify-between items-center">
          <Link href="/" className="flex items-center mb-4 sm:mb-0">
            <div className="bg-yellow-500 text-black px-4 py-2 rounded font-bold text-xl mr-2">
              {appName.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-2xl font-bold text-black">{appName}</span>
          </Link>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSubmit} className="w-full sm:w-auto max-w-md sm:max-w-xs">
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
            <button className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold hover:bg-red-700 transition-colors flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              LIVE
            </button>
            <button className="text-black hover:text-yellow-600 font-medium transition-colors">
              Sign Up
            </button>
            <ThemeLanguageSwitcher />
          </div>
        </div>
        
        {/* Category Filter Navigation */}
        {categories.length > 0 && onSelectCategory && (
          <nav className="py-3 border-t border-gray-200">
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onSelectCategory={onSelectCategory} 
            />
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
