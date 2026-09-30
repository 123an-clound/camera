import type { Metadata } from "next";
import type { ReactNode } from "react";

// The cart is personal and has no search value.
export const metadata: Metadata = { title: "Giỏ yêu cầu", robots: { index: false, follow: false } };

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
