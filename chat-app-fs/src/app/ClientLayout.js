"use client";

import { AuthProvider } from "./useAuth";

export default function ClientLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
