import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";

// Admin must never be indexed by search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  // getSession() reads the cookie locally (no network round trip). Safe here
  // because proxy.ts already did the authoritative getUser() check for this
  // request — this call only decides whether to render the sidebar chrome.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto p-6">{children}</main>
    </div>
  );
}
