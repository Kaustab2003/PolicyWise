"use client"

import * as React from "react"
import { Check, Languages } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const languages = [
    // Existing and other world languages
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "ar", label: "العربية", flag: "🇸🇦" },
    { value: "bn", label: "বাংলা", flag: "🇧🇩" },
    { value: "zh", label: "中文", flag: "🇨🇳" },
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "de", label: "Deutsch", flag: "🇩🇪" },
    { value: "he", label: "עברית", flag: "🇮🇱" },
    { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { value: "it", label: "Italiano", flag: "🇮🇹" },
    { value: "ja", label: "日本語", flag: "🇯🇵" },
    { value: "ko", label: "한국어", flag: "🇰🇷" },
    { value: "pt", label: "Português", flag: "🇵🇹" },
    { value: "ru", label: "Русский", flag: "🇷🇺" },
    { value: "es", label: "Español", flag: "🇪🇸" },
    { value: "sv", label: "Svenska", flag: "🇸🇪" },
    
    // Indian Languages
    { value: "as", label: "অসমীয়া", flag: "🇮🇳" },
    // Bengali (bn) is already included
    { value: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
    // Hindi (hi) is already included
    { value: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
    { value: "ks", label: "कश्मीरी", flag: "🇮🇳" },
    { value: "ml", label: "മലയാളം", flag: "🇮🇳" },
    { value: "mr", label: "मराठी", flag: "🇮🇳" },
    { value: "ne", label: "नेपाली", flag: "🇳🇵" },
    { value: "or", label: "ଓଡ଼ିଆ", flag: "🇮🇳" },
    { value: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    { value: "sa", label: "संस्कृतम्", flag: "🇮🇳" },
    { value: "sd", label: "सिन्धी", flag: "🇮🇳" },
    { value: "ta", label: "தமிழ்", flag: "🇮🇳" },
    { value: "te", label: "తెలుగు", flag: "🇮🇳" },
    { value: "ur", label: "اردو", flag: "🇵🇰" },
]

// Note: Bodo, Dogri, Konkani, Maithili, Manipuri, Santali are not included as they may not have standard ISO 639-1 codes supported by the translation service.

type LanguageSelectorProps = {
    value: string;
    onValueChange: (value: string) => void;
}

export function LanguageSelector({ value, onValueChange }: LanguageSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const selectedLanguage = languages.find((language) => language.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          aria-label="Select a language"
        >
            <div className="flex items-center gap-2">
                {selectedLanguage ? (
                    <>
                    <span className="text-lg">{selectedLanguage.flag}</span>
                    {selectedLanguage.label}
                    </>
                ) : (
                    "Select language..."
                )}
            </div>
          <Languages className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.sort((a, b) => a.label.localeCompare(b.label)).map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2 text-lg">{language.flag}</span>
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
