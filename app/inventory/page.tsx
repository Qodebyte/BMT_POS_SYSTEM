
import { usePageGuard } from "../hooks/usePageGuard";
import { InventoryLayout } from "./components/InventoryLayout";
import { InventoryPage } from "./components/InventoryPage";


export default function Inventory() {
   
  return (
    <InventoryLayout>
      <InventoryPage />
    </InventoryLayout>
  );
}