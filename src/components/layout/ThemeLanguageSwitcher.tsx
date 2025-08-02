
"use client";

import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, MoreVertical, Check, LanguagesIcon } from "lucide-react";
import Link from "next/link";

export default function ThemeLanguageSwitcher() {
  const { theme, setTheme, language, setLanguage, currentLanguageOptions, getUIText, isClient } = useAppContext();

  if (!isClient) {
    return <div className="w-10 h-10" />; // Placeholder for SSR to avoid layout shift
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Options menu" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200">
        <DropdownMenuLabel className="text-gray-900">{getUIText("theme")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
          <DropdownMenuRadioItem value="light" className="text-gray-700 hover:bg-gray-50">
            <Sun className="mr-2 h-4 w-4" />
            {getUIText("lightTheme")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="text-gray-700 hover:bg-gray-50">
            <Moon className="mr-2 h-4 w-4" />
            {getUIText("darkTheme")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator className="bg-gray-200" />

        <DropdownMenuLabel className="text-gray-900">{getUIText("language")}</DropdownMenuLabel>
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-gray-700 hover:bg-gray-50">
                <LanguagesIcon className="mr-2 h-4 w-4" />
                <span>{currentLanguageOptions.find(l => l.value === language)?.label || language}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-white border border-gray-200">
                 <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                    {currentLanguageOptions.map((lang) => (
                    <DropdownMenuRadioItem key={lang.value} value={lang.value} className="text-gray-700 hover:bg-gray-50">
                        {lang.label}
                        {language === lang.value && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
        

        <DropdownMenuSeparator className="bg-gray-200" />

        <Link href="/faq" passHref legacyBehavior>
          <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-50">
            <a>{getUIText("faq")}</a>
          </DropdownMenuItem>
        </Link>
        <Link href="/terms" passHref legacyBehavior>
          <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-50">
            <a>{getUIText("termsAndConditions")}</a>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
