import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path?: string) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;

  const cleanPath = (path.startsWith('/') ? path.substring(1) : path).replace(/\\/g, '/');
  return `http://localhost:5000/${cleanPath}`;
}
