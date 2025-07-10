"use client"
import { AuthProvider } from "@/contexts/AuthContext";
import { MemosProvider } from "@/contexts/MemosContext";
import AppContent from "../layout";

export default function MemosLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MemosProvider>
            <AppContent>{children}</AppContent>
          </MemosProvider>
        </AuthProvider>
      </body>
    </html>
  );
}