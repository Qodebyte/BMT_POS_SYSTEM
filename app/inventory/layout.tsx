'use client';

import { usePageGuard } from "../hooks/usePageGuard";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  usePageGuard(['view_inventory']);

  return <>{children}</>;
}
