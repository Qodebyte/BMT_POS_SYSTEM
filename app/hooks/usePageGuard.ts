'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "../utils/permission";
import { AdminDetail } from "../utils/type";

export const usePageGuard = (requiredPermissions: string[] = []) => {
  const router = useRouter();

  useEffect(() => {
    
    const stored = localStorage.getItem("adminDetail");

    if (!stored) {
      router.replace("/auth/login");
      return;
    }

   

    const admin: AdminDetail = JSON.parse(stored);

  
    if (admin.role === "Super Admin" || admin.role === "DEVELOPER") return;
  
    
    if (requiredPermissions.length === 0) return;

    const allowed = hasPermission(admin.permissions ?? [], requiredPermissions);

    if (!allowed) {
      router.replace("/pos"); 
    }
  }, [router, requiredPermissions]);
};
