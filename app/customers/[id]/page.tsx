import { InventoryLayout } from '@/app/inventory/components/InventoryLayout';
import { CustomerDetailPage } from './CustomerPage';



export default async function Page() {

  
  return (
    <InventoryLayout>
      <CustomerDetailPage  />
    </InventoryLayout>
  );
}