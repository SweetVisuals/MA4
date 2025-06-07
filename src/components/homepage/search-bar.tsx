"use client";

import { Input } from "@/components/@/ui/input";
import { Label } from "@/components/@/ui/label";
import { Loader2, Mic, Search } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface SearchBarProps {
  className?: string;
}

function SearchBar({ className }: SearchBarProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (inputValue) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [inputValue]);

  return (
    <div className={`min-w-[300px] ${className}`}>
      <div className="relative">
        <Input
          id={id}
          className="peer pe-9 ps-9 h-8"
          placeholder="Search..."
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          {isLoading ? (
            <Loader2
              className="animate-spin"
              size={16}
              strokeWidth={2}
              role="status"
              aria-label="Loading..."
            />
          ) : (
            <Search size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}

export { SearchBar };
