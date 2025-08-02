
"use client";

import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import type { SeoSettings } from "@/lib/types";
import { getSeoSettings } from "@/lib/data";
import { Youtube, Facebook, Link as LinkIcon } from "lucide-react"; 

export default function Footer() {
  const { getUIText, isClient } = useAppContext();
  const [year, setYear] = useState(2025); // Static for SSR
  const [footerText, setFooterText] = useState({
    reserved: "",
    poweredBy: "",
    appName: ""
  });
  const [seoSettings, setSeoSettings] = useState<SeoSettings | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear()); 
    if (isClient) {
      setFooterText({
        reserved: getUIText("footerReserved"),
        poweredBy: getUIText("footerPoweredBy"),
        appName: getUIText("appName")
      });

      const fetchSettings = async () => {
        try {
          const settings = await getSeoSettings();
          setSeoSettings(settings);
        } catch (error) {
          console.error("Error fetching SEO settings for footer:", error);
        }
      };
      fetchSettings();

    } else {
       setFooterText({
        reserved: "All rights reserved.",
            poweredBy: "Powered by AjkerDhara",
    appName: "AjkerDhara"
      });
    }
  }, [isClient, getUIText]);


  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-4 mb-3">
            {seoSettings?.footerYoutubeUrl && (
                <a href={seoSettings.footerYoutubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-500 hover:text-blue-600 transition-colors">
                    <Youtube className="h-6 w-6" />
                </a>
            )}
            {seoSettings?.footerFacebookUrl && (
                <a href={seoSettings.footerFacebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-500 hover:text-blue-600 transition-colors">
                    <Facebook className="h-6 w-6" />
                </a>
            )}
            {seoSettings?.footerMoreLinksUrl && (
                <a href={seoSettings.footerMoreLinksUrl} target="_blank" rel="noopener noreferrer" aria-label="More Links" className="text-gray-500 hover:text-blue-600 transition-colors">
                    <LinkIcon className="h-6 w-6" />
                </a>
            )}
        </div>
        <p className="text-sm text-gray-600">
          &copy; {year} {footerText.appName}. {footerText.reserved}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {footerText.poweredBy}
        </p>
      </div>
    </footer>
  );
}
