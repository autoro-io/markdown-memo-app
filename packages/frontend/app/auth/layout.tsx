"use client"
import { AuthProvider } from "@/frontend/contexts/AuthContext";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}