"use client";

import { useState, KeyboardEvent } from "react";
import { X, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput = ({
  value,
  onChange,
  placeholder = "Escribe y presiona Enter",
  className,
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  
  // Convertir string separado por comas a array
  const tags = value
    ? value.split(",").map(tag => tag.trim()).filter(Boolean)
    : [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    // Evitar duplicados
    if (tags.includes(trimmedTag)) {
      setInputValue("");
      return;
    }

    const newTags = [...tags, trimmedTag];
    onChange(newTags.join(", "));
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags.join(", "));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Eliminar el último tag si presiona backspace con input vacío
      removeTag(tags.length - 1);
    } else if (e.key === "," || e.key === ";") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleBlur = () => {
    // Agregar tag al perder el foco si hay texto
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="pl-3 pr-1 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors group"
            >
              <TagIcon className="w-3 h-3 mr-1.5" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-2 p-0.5 rounded-sm hover:bg-primary/30 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pr-10"
        />
        <TagIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Helper Text */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <div className="flex-1 space-y-1">
          <p>• Presiona <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Enter</kbd> o <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">,</kbd> para agregar</p>
          <p>• Presiona <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Backspace</kbd> para eliminar el último</p>
        </div>
        <div className="text-right">
          <span className="font-semibold">{tags.length}</span> {tags.length === 1 ? "etiqueta" : "etiquetas"}
        </div>
      </div>
    </div>
  );
};
