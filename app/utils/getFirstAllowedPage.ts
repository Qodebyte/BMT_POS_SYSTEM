import { AdminDetail } from "@/app/utils/type";
import { PAGE_PERMISSIONS } from "./pagePermissions";


export function getFirstAllowedPage(adminDetail: AdminDetail): string | null {
  const adminPerms = adminDetail.permissions || [];

 
  for (const [page, perms] of Object.entries(PAGE_PERMISSIONS)) {
    if (perms.every(p => adminPerms.includes(p))) {
      return page;
    }
  }

  
  return null;
}
