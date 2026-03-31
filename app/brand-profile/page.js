"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function BrandProfile() {
  const router = useRouter();
  useEffect(() => { router.replace("/adn"); }, []);
  return null;
}