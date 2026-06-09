"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@chowvest/ui";
import axios from "axios";
import { MapPin } from "lucide-react";
import { useDebounce } from "use-debounce";

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter your address",
  disabled = false,
  className = "",
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [debouncedValue] = useDebounce(inputValue, 500);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal input value with external value if it changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || "");
    }
  }, [value]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedValue || debouncedValue.length < 3) {
        setSuggestions([]);
        return;
      }

      // If the user selected an item, the debouncedValue will match `value`. We don't need to re-fetch.
      if (debouncedValue === value) {
        return;
      }

      try {
        setIsLoading(true);
        const res = await axios.post("/api/maps/autocomplete", { input: debouncedValue });
        setSuggestions(res.data.suggestions || []);
        if (res.data.suggestions && res.data.suggestions.length > 0) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch address suggestions", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val); // Always keep the parent synced
    if (!isOpen && val.length >= 3) {
      setIsOpen(true);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const text = suggestion.placePrediction?.text?.text || "";
    setInputValue(text);
    onChange(text);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        className={`w-full ${className}`}
        onFocus={() => {
           if (suggestions.length > 0) setIsOpen(true);
        }}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => {
             const text = suggestion.placePrediction?.text?.text;
             if (!text) return null;
             return (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-muted/50 focus:bg-muted/50 border-b border-border/50 last:border-0 flex items-start gap-3 transition-colors"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{text}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}
