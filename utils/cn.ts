import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes efficiently
 * 
 * This function combines the power of `clsx` for conditional classes 
 * and `tailwind-merge` for intelligent merging of Tailwind CSS classes.
 * It automatically resolves conflicts between Tailwind classes by keeping 
 * the last one in the list.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn("px-2 py-1", "bg-red-500")
 * 
 * // Conditional classes
 * cn("px-2 py-1", isActive && "bg-blue-500", "hover:bg-blue-600")
 * 
 * // Conflicting classes - 'bg-blue-500' will override 'bg-red-500'
 * cn("bg-red-500", "bg-blue-500")
 * 
 * // With arrays and objects
 * cn(["px-2", "py-1"], { "bg-blue-500": isActive })
 * ```
 * 
 * @param inputs - Class values to merge (strings, arrays, objects, conditionals)
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
