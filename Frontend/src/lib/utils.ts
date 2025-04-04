import { clsx, type ClassValue } from "clsx"//for applying conditional css
import { twMerge } from "tailwind-merge"//for merging tailwind classes last class will be implemented

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}//cn is a function that takes in any number of class names and merges them into a single string. It uses the clsx library to handle conditional class names and the tailwind-merge library to merge Tailwind CSS classes, ensuring that the last class takes precedence in case of conflicts.
