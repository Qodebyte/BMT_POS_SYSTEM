'use client';

import { usePageGuard } from "../hooks/usePageGuard";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  usePageGuard(['view_sales']);

  return <>{children}</>;
}
