
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Lock, UserCog, Plus, Pencil, Trash2, Save, Upload, Eye, EyeOff, CheckCircle, Percent } from 'lucide-react';
import { InventoryLayout } from '../inventory/components/InventoryLayout';
import { toast } from 'sonner';
import Link from 'next/link';
import { usePageGuard } from '../hooks/usePageGuard';


const ADMIN_MANAGEMENT = {
  CREATE_ADMIN: 'create_admin',
  EDIT_ADMIN: 'edit_admin',
  DELETE_ADMIN: 'delete_admin',
  ASSIGN_ROLES: 'assign_roles', 
  VIEW_ADMIN_LOGS: 'view_admin_logs',
  MANAGE_ROLES_PERMISSIONS: 'manage_roles_permissions',
  CREATE_ROLE: 'create_role',
  REMOVE_ROLE: 'remove_role',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_REPORTS: 'manage_reports',
  VIEW_ADMINS: 'view_admins',
  VIEW_ADMIN_PROFILE: 'view_admin_profile',
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
};

const PRODUCT_PERMISSIONS = {
  CREATE_PRODUCT: 'create_product',
  VIEW_PRODUCT: 'view_product',
  VIEW_PRODUCTS: 'view_products',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',
  MANAGE_VARIANTS: 'manage_variants',
  MANAGE_CATEGORIES: 'manage_categories',
  MANAGE_ATTRIBUTES: 'manage_attributes',
  CREATE_PRODUCT_CATEGORIES: 'create_product_categories',
  VIEW_PRODUCT_CATEGORIES: 'view_product_categories',
  UPDATE_PRODUCT_CATEGORIES: 'update_product_categories',
  DELETE_PRODUCT_CATEGORIES: 'delete_product_categories',
  CREATE_PRODUCT_ATTRIBUTES: 'create_product_attributes',
  CREATE_ATTRIBUTE_AND_VALUES: 'create_attribute_and_values',
  CREATE_ATTRIBUTE_VALUES: 'create_attribute_values',
  VIEW_PRODUCT_ATTRIBUTES: 'view_product_attributes',
  UPDATE_PRODUCT_ATTRIBUTES: 'update_product_attributes',
  DELETE_PRODUCT_ATTRIBUTES: 'delete_product_attributes',
  DELETE_ATTRIBUTE_VALUES: 'delete_attribute_values',
  CREATE_PRODUCT_VARIANTS: 'create_product_variants',
  VIEW_PRODUCT_VARIANTS: 'view_product_variants',
  UPDATE_PRODUCT_VARIANTS: 'update_product_variants',
  DELETE_PRODUCT_VARIANTS: 'delete_product_variants',
};

const SALES_PERMISSIONS = {
  CREATE_SALE: 'create_sale',
  VIEW_SALES: 'view_sales',
  MANAGE_ORDERS: 'manage_orders',
  DELETE_ORDERS: 'delete_orders',
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDER: 'create_order',
  VIEW_ANALYTICS: 'view_analytics',
};

const DISCOUNT_PERMISSIONS = {
  CREATE_DISCOUNT: 'create_discount',
  VIEW_DISCOUNTS: 'view_discounts',
  UPDATE_DISCOUNT: 'update_discount',
  DELETE_DISCOUNT: 'delete_discount',
  LINK_DISCOUNT: 'link_discount',
};

const TAX_PERMISSIONS = {
  CREATE_TAX: 'create_tax',
  VIEW_TAXES: 'view_taxes',
  UPDATE_TAX: 'update_tax',
  DELETE_TAX: 'delete_tax',
};

const STAFF_PERMISSIONS = {
  CREATE_STAFF: 'create_staff',
  VIEW_STAFF: 'view_staff',
  UPDATE_STAFF: 'update_staff',
  DELETE_STAFF: 'delete_staff',
  MANAGE_STAFF: 'manage_staff',
  MANAGE_ROLES: 'manage_roles',
  VIEW_ROLES: 'view_roles',
  VIEW_LOGIN_HISTORY: 'view_login_history',
};

const CUSTOMER_PERMISSIONS = {
  CREATE_CUSTOMER: 'create_customer',
  VIEW_CUSTOMER: 'view_customer',
  UPDATE_CUSTOMER: 'update_customer',
  DELETE_CUSTOMER: 'delete_customer',
  VIEW_CUSTOMER_HISTORY: 'view_customer_history',
};

const FINANCIAL_PERMISSIONS = {
  CREATE_EXPENSE_CATEGORY: 'create_expense_category',
  VIEW_EXPENSE_CATEGORY: 'view_expense_category',
  UPDATE_EXPENSE_CATEGORY: 'update_expense_category',
  DELETE_EXPENSE_CATEGORY: 'delete_expense_category',
  CREATE_EXPENSE: 'create_expense',
  VIEW_EXPENSES: 'view_expenses',
  UPDATE_EXPENSE: 'update_expense',
  DELETE_EXPENSE: 'delete_expense',
  APPROVE_EXPENSE: 'approve_expense',
  REJECT_EXPENSE: 'reject_expense',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
};

const INVENTORY_MGT_PERMISSIONS = {
  VIEW_INVENTORY: 'view_inventory',
  ADJUST_INVENTORY: 'adjust_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
};

const LOGIN_ATTEMPT_PERMISSIONS = {
  VIEW_LOGIN_ATTEMPTS: 'view_login_attempts',
  APPROVE_LOGIN_ATTEMPT: 'approve_login_attempt',
  REJECT_LOGIN_ATTEMPT: 'reject_login_attempt',
  MANAGE_LOGIN_ATTEMPTS: 'manage_login_attempts',
};

const CATEGORY_ATTRIBUTE_PERMISSIONS = {
  MANAGE_CATEGORIES: 'manage_categories',
  MANAGE_ATTRIBUTES: 'manage_attributes',
}

const ALL_PERMISSIONS = {
  ...ADMIN_MANAGEMENT,
  ...SALES_PERMISSIONS,
  ...PRODUCT_PERMISSIONS,
  ...STAFF_PERMISSIONS,
  ...CUSTOMER_PERMISSIONS,
  ...FINANCIAL_PERMISSIONS,
  ...INVENTORY_MGT_PERMISSIONS,
  ...LOGIN_ATTEMPT_PERMISSIONS,
  ...DISCOUNT_PERMISSIONS,
  ...TAX_PERMISSIONS,
  ...CATEGORY_ATTRIBUTE_PERMISSIONS,
};




const PERMISSION_GROUPS = [
  {
    name: 'Admin Management',
    permissions: ADMIN_MANAGEMENT,
    description: 'Manage admins, roles, and system settings',
  },
  {
    name: 'Product Management',
    permissions: PRODUCT_PERMISSIONS,
    description: 'Manage products, categories, and attributes',
  },
  {
    name: 'Sales Management',
    permissions: SALES_PERMISSIONS,
    description: 'Manage sales, orders, and analytics',
  },
  {
    name: 'Discounts',
    permissions: DISCOUNT_PERMISSIONS,
    description: 'Create and manage discounts',
  },
  {
    name: 'Taxes',
    permissions: TAX_PERMISSIONS,
    description: 'Manage tax configurations',
  },
  {
    name: 'Inventory Management',
    permissions: INVENTORY_MGT_PERMISSIONS,
    description: 'Manage inventory and stock adjustments',
  },
  {
    name: 'Staff Management',
    permissions: STAFF_PERMISSIONS,
    description: 'Manage staff accounts and roles',
  },
  {
    name: 'Customer Management',
    permissions: CUSTOMER_PERMISSIONS,
    description: 'Manage customer data and history',
  },
  {
    name: 'Financial Management',
    permissions: FINANCIAL_PERMISSIONS,
    description: 'Manage expenses and financial reports',
  },
  {
    name: 'Login Attempts',
    permissions: LOGIN_ATTEMPT_PERMISSIONS,
    description: 'Approve or reject login attempts',
  },
  {
    name: 'Category & Attribute Management',
    permissions: CATEGORY_ATTRIBUTE_PERMISSIONS,
    description: 'Manage product categories and attributes',
  }
];



const formatPermissionLabel = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

type Role = {
  roles_id: string;
  role_name: string;
  permissions: string[];
  createdAt: string;
  role_count: number;
};

type BusinessInfo = {
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  businessLogo: File | string | null;
};

export default function SettingsPage() {
    usePageGuard();
  const [activeTab, setActiveTab] = useState('business');
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  };
 const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
  ownerFirstName: '',
  ownerLastName: '',
  ownerEmail: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  businessLogo: null,
});

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [taxRate, setTaxRate] = useState<number>(0);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [tempTaxRate, setTempTaxRate] = useState<number>(0);
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    permissions: [] as string[],
  });
  const [selectAll, setSelectAll] = useState(false);

  const ROLES_PER_PAGE = 5;

const [currentRolePage, setCurrentRolePage] = useState(1);

const totalRolePages = Math.ceil(roles.length / ROLES_PER_PAGE);

const paginatedRoles = roles.slice(
  (currentRolePage - 1) * ROLES_PER_PAGE,
  currentRolePage * ROLES_PER_PAGE
);


  useEffect(() => {
    const savedTaxRate = localStorage.getItem('pos_default_tax_rate');
    if (savedTaxRate) {
      const rate = parseFloat(savedTaxRate);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTaxRate(rate);
      setTempTaxRate(rate);
    }
  }, []);

  
  const handleTaxRateSave = () => {
    if (tempTaxRate < 0 || tempTaxRate > 100) {
      toast('Tax rate must be between 0 and 100!');
      return;
    }

    setTaxRate(tempTaxRate);
    localStorage.setItem('pos_default_tax_rate', tempTaxRate.toString());
    setIsTaxDialogOpen(false);
    toast('Tax rate updated successfully!');
  };

  const handleTaxDialogOpen = () => {
    setTempTaxRate(taxRate);
    setIsTaxDialogOpen(true);
  };


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setBusinessInfo(prev => ({ ...prev, businessLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleBusinessInfoSave = async () => {
  try {
    const formData = new FormData();

    formData.append('owner_first_name', businessInfo.ownerFirstName);
    formData.append('owner_last_name', businessInfo.ownerLastName);
    formData.append('owner_email', businessInfo.ownerEmail);
    formData.append('company_email', businessInfo.companyEmail);
    formData.append('company_phone', businessInfo.companyPhone);
    formData.append('company_address', businessInfo.companyAddress);
    if (businessInfo.businessLogo instanceof File) {
  formData.append('logo', businessInfo.businessLogo);
}


    const res = await fetch(`${apiUrl}/settings`, {
      method: 'PUT',
      body: formData,
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    toast.success('Business settings updated');
  } catch (error: unknown) {
    console.error("Error updating business settings:", error);
    toast.error(error instanceof Error ? error.message : "Update failed");
  }
};



const handlePasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/auth/password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${getAuthToken()}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    toast.success('Password updated');
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : 'Password update failed');
  }
};



useEffect(() => {
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${apiUrl}/roles?page=${currentRolePage}&limit=${ROLES_PER_PAGE}`, {
        headers: {
          "Authorization": `Bearer ${getAuthToken()}`,
        },
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setRoles(
          data.roles.map((r: Role) => ({
            roles_id: r.roles_id,
            role_name: r.role_name,
            permissions: r.permissions || [],
            createdAt: r.createdAt.split('T')[0],
            role_count: r.role_count || 0,
          }))
        );
      }
    } catch (err)   {
      toast.error('Failed to load roles');
    console.error('Error fetching roles:', err);
    }
  };
   fetchRoles();
}, [currentRolePage]);




useEffect(() => {
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${apiUrl}/settings`, {
        headers: {
          "Authorization": `Bearer ${getAuthToken()}`,
        },
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setBusinessInfo({
          ownerFirstName: data.settings.owner_first_name || '',
          ownerLastName: data.settings.owner_last_name || '',
          ownerEmail: data.settings.owner_email || '',
          companyEmail: data.settings.company_email || '',
          companyPhone: data.settings.company_phone || '',
          companyAddress: data.settings.company_address || '',
          businessLogo: data.settings.site_logo || null,
        });

        setLogoPreview(data.settings.site_logo || null);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    }
  };

  fetchSettings();
}, []);


const handleCreateRole = async () => {
  try {
    const res = await fetch(`${apiUrl}/roles/create-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${getAuthToken()}` },
      credentials: 'include',
      body: JSON.stringify({
        role_name: roleForm.name,
        permissions: roleForm.permissions,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    toast.success('Role created');
    setIsRoleDialogOpen(false);
    setRoleForm({ name: '', permissions: [] });
    setSelectAll(false);
    setCurrentRolePage(1);
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Failed to create role');
  }
};



  const handleUpdateRole = async () => {
  if (!editingRole) return;

  try {
    const res = await fetch(`${apiUrl}/roles/${editingRole.roles_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${getAuthToken()}` },
      credentials: 'include',
      body: JSON.stringify({
        role_name: roleForm.name,
        permissions: roleForm.permissions,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    toast.success('Role updated');
    setIsEditDialogOpen(false);
    setEditingRole(null);
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Failed to update role');
  }
};



  const handleDeleteRole = async (id: string) => {
  if (!confirm('Delete this role?')) return;

  try {
    const res = await fetch(`${apiUrl}/roles/${id}`, {
      headers: { "Authorization": `Bearer ${getAuthToken()}` },
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    toast.success('Role deleted');
    setRoles(prev => prev.filter(r => r.roles_id !== id));
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Failed to delete role');
  }
};



  const startEditingRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.role_name,
      permissions: [...role.permissions],
    });
    setIsEditDialogOpen(true);
  };

  
  const togglePermission = (permission: string) => {
    setRoleForm(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      
    
      const allPermissionValues = Object.values(ALL_PERMISSIONS);
      setSelectAll(newPermissions.length === allPermissionValues.length);
      
      return { ...prev, permissions: newPermissions };
    });
  };


  const toggleGroupPermissions = (groupPermissions: string[], checked: boolean) => {
    setRoleForm(prev => {
      let newPermissions = [...prev.permissions];
      
      if (checked) {
    
        groupPermissions.forEach(permission => {
          if (!newPermissions.includes(permission)) {
            newPermissions.push(permission);
          }
        });
      } else {
 
        newPermissions = newPermissions.filter(
          permission => !groupPermissions.includes(permission)
        );
      }
      
   
      const allPermissionValues = Object.values(ALL_PERMISSIONS);
      setSelectAll(newPermissions.length === allPermissionValues.length);
      
      return { ...prev, permissions: newPermissions };
    });
  };


  const toggleAllPermissions = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setRoleForm(prev => ({
        ...prev,
        permissions: Object.values(ALL_PERMISSIONS)
      }));
    } else {
      setRoleForm(prev => ({ ...prev, permissions: [] }));
    }
  };


  const isGroupSelected = (groupPermissions: string[]) => {
    return groupPermissions.every(permission => 
      roleForm.permissions.includes(permission)
    );
  };


  const isGroupPartial = (groupPermissions: string[]) => {
    const selectedCount = groupPermissions.filter(permission => 
      roleForm.permissions.includes(permission)
    ).length;
    return selectedCount > 0 && selectedCount < groupPermissions.length;
  };


  const countPermissions = (permissions: string[]) => {
    const counts: Record<string, number> = {};
    PERMISSION_GROUPS.forEach(group => {
      const groupPerms = Object.values(group.permissions);
      const count = permissions.filter(p => groupPerms.includes(p)).length;
      if (count > 0) {
        counts[group.name] = count;
      }
    });
    return counts;
  };

  return (
    <InventoryLayout>
      <div className="p-1 md:p-4 space-y-6 bg-white text-gray-900">

        <div className="  grid grid-cols-1 gap-2 md:gap-0 md:flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-gray-500">Manage your business settings and permissions</p>
          </div>
          
          
          <div className='grid grid-cols-1 gap-2'>
            <Link href="/barcode">
            <Button variant="link" className="bg-gray-900 hover:bg-gray-800 text-gray-100">
             Print Barcodes
            </Button>
          </Link>       
          <Dialog open={isTaxDialogOpen} onOpenChange={setIsTaxDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleTaxDialogOpen}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Percent className="w-4 h-4" />
                Set Tax Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900 ">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Set Default Tax Rate
                </DialogTitle>
                <DialogDescription>
                  Configure the default tax rate used across all sales. This can be adjusted per transaction.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <Alert className="bg-gray-800 border-blue-200">
                  <AlertDescription className="text-gray-300">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Current tax rate: <span className="font-bold">{taxRate}%</span>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-input">Tax Rate (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="tax-input"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={tempTaxRate}
                        onChange={(e) => setTempTaxRate(parseFloat(e.target.value) || 0)}
                        placeholder="Enter tax rate"
                        className="flex-1"
                      />
                      <span className="text-gray-600 font-medium">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Enter a value between 0 and 100. Leave as 0 for no tax.
                    </p>
                  </div>

                  {tempTaxRate > 0 && (
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Example:</span> On a NGN 1,000 sale, tax would be NGN {(1000 * tempTaxRate / 100).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTempTaxRate(taxRate);
                    setIsTaxDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleTaxRateSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Tax Rate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
        


        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full ">
          <TabsList className="grid w-full md:w-auto grid-cols-1 sm:grid-cols-2 bg-gray-900 text-white h-20 md:h-10">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Business Details
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
              <Card className="border border-gray-200 bg-gray-100 text-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                  <CardDescription>
                    Update your business details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ownerFirstName">Owner First Name</Label>
                        <Input
                          id="ownerFirstName"
                          value={businessInfo.ownerFirstName || ''}
                          onChange={(e) => setBusinessInfo({...businessInfo, ownerFirstName: e.target.value})}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerLastName">Owner Last Name</Label>
                        <Input
                          id="ownerLastName"
                          value={businessInfo.ownerLastName || ''}
                          onChange={(e) => setBusinessInfo({...businessInfo, ownerLastName: e.target.value})}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerEmail">Owner Email</Label>
                      <Input
                        id="ownerEmail"
                        type="email"
                        value={businessInfo.ownerEmail || ''}
                        onChange={(e) => setBusinessInfo({...businessInfo, ownerEmail: e.target.value})}
                        placeholder="owner@business.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Company Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={businessInfo.companyEmail || ''}
                        onChange={(e) => setBusinessInfo({...businessInfo, companyEmail: e.target.value})}
                        placeholder="info@business.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Company Phone</Label>
                      <Input
                        id="companyPhone"
                        value={businessInfo.companyPhone || ''}
                        onChange={(e) => setBusinessInfo({...businessInfo, companyPhone: e.target.value})}
                        placeholder="+234 123 456 7890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Company Address</Label>
                      <Textarea
                        id="companyAddress"
                        value={businessInfo.companyAddress || ''}
                        onChange={(e) => setBusinessInfo({...businessInfo, companyAddress: e.target.value})}
                        placeholder="Enter your business address"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Business Logo</Label>
                      <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-shrink-0">
                          <Avatar className="w-24 h-24 border-2 border-gray-200">
                            <AvatarImage src={logoPreview || businessInfo.businessLogo || ''} />
                            <AvatarFallback className="text-lg">
                              {businessInfo.ownerFirstName?.[0]}{businessInfo.ownerLastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                     <Input
  type="file"
  accept="image/*"
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoPreview(URL.createObjectURL(file));
    setBusinessInfo(prev => ({
      ...prev,
      businessLogo: file, 
    }));
  }}
/>


                            <Label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center">
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm font-medium">Click to upload logo</span>
                              <span className="text-xs text-gray-500">PNG, JPG up to 2MB</span>
                            </Label>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Recommended size: 400x400 pixels. Maximum file size: 2MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBusinessInfoSave}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Business Information
                  </Button>
                </CardContent>
              </Card>

        
              <Card className="border border-gray-200 bg-gray-100 text-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Admin Password
                  </CardTitle>
                  <CardDescription>
                    Update your administrator password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="bg-yellow-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Password must be at least 8 characters long
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Old Password</Label>
                      <div className="relative">
                        <Input
                          id="oldPassword"
                          type={showPasswords.old ? "text" : "password"}
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                          placeholder="Enter old password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                        >
                          {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePasswordChange}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

     
          <TabsContent value="roles" className="space-y-6">
          
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Roles & Permissions</h2>
                <p className="text-sm text-gray-500">Manage user roles and their permissions</p>
              </div>
              <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900">
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>
                      Define a new role and assign permissions
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Role Name *</Label>
                      <Input
                        id="role-name"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                        placeholder="e.g., Sales Manager"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium">Permissions</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all"
                            checked={selectAll}
                            onCheckedChange={(checked) => toggleAllPermissions(checked as boolean)}
                          />
                          <Label htmlFor="select-all" className="text-sm font-medium">
                            Select All Permissions
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {PERMISSION_GROUPS.map((group) => {
                          const groupPermissions = Object.values(group.permissions);
                          const isSelected = isGroupSelected(groupPermissions);
                          const isPartial = isGroupPartial(groupPermissions);
                          
                          return (
                            <Card key={group.name} className="border border-gray-200 bg-gray-900 ">
                              <CardHeader className="py-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-sm font-medium">
                                      {group.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      {group.description}
                                    </CardDescription>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`group-${group.name}`}
                                      checked={isSelected}
                                      onCheckedChange={(checked) => toggleGroupPermissions(groupPermissions, checked as boolean)}
                                      className={
                                        isPartial 
                                          ? "data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400" 
                                          : ""
                                      }
                                    />
                                    <Label htmlFor={`group-${group.name}`} className="text-sm">
                                      Select All
                                    </Label>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {Object.entries(group.permissions).map(([key, value]) => (
                                    <div key={value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={value}
                                        checked={roleForm.permissions.includes(value)}
                                        onCheckedChange={() => togglePermission(value)}
                                      />
                                      <Label 
                                        htmlFor={value} 
                                        className="text-sm font-normal cursor-pointer flex-1"
                                      >
                                        {formatPermissionLabel(key)}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsRoleDialogOpen(false);
                        setRoleForm({ name: '', permissions: [] });
                        setSelectAll(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateRole}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900"
                    >
                      Create Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

           
            <Card className="border border-gray-200 bg-gray-900 ">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRoles.map((role) => {
                        const permissionCounts = countPermissions(role.permissions);
                        
                        return (
                          <TableRow key={role.roles_id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                                {role.role_name}
                                {role.role_name === 'Super Admin' && (
                                  <Badge className="bg-yellow-100 text-green-800 text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {Object.entries(permissionCounts).map(([group, count]) => (
                                  <Badge key={group} variant="outline" className="text-xs">
                                    {group}: {count}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{role.role_count} users</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {role.createdAt}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditingRole(role)}
                                  disabled={role.role_name === 'Super Admin'}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRole(role.roles_id)}
                                  disabled={role.role_name === 'Super Admin'}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="sm:flex sm:items-center sm:justify-between px-4 py-3 border-t grid grid-cols-1 gap-2 border-gray-800">
  <p className="text-sm text-gray-400">
    Page {currentRolePage} of {totalRolePages || 1}
  </p>

  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      disabled={currentRolePage === 1}
      onClick={() =>
        setCurrentRolePage(p => Math.max(1, p - 1))
      }
    >
      Previous
    </Button>

    <Button
      variant="outline"
      size="sm"
      disabled={currentRolePage === totalRolePages || totalRolePages === 0}
      onClick={() =>
        setCurrentRolePage(p => Math.min(totalRolePages, p + 1))
      }
    >
      Next
    </Button>
  </div>
</div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name *</Label>
              <Input
                id="edit-role-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                placeholder="e.g., Sales Manager"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Permissions</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-select-all"
                    checked={selectAll}
                    onCheckedChange={(checked) => toggleAllPermissions(checked as boolean)}
                  />
                  <Label htmlFor="edit-select-all" className="text-sm font-medium">
                    Select All Permissions
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                {PERMISSION_GROUPS.map((group) => {
                  const groupPermissions = Object.values(group.permissions);
                  const isSelected = isGroupSelected(groupPermissions);
                  const isPartial = isGroupPartial(groupPermissions);
                  
                  return (
                    <Card key={group.name} className="border border-gray-200">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-medium">
                              {group.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {group.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-group-${group.name}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => toggleGroupPermissions(groupPermissions, checked as boolean)}
                              className={
                                isPartial 
                                  ? "data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400" 
                                  : ""
                              }
                            />
                            <Label htmlFor={`edit-group-${group.name}`} className="text-sm">
                              Select All
                            </Label>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(group.permissions).map(([key, value]) => (
                            <div key={value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-${value}`}
                                checked={roleForm.permissions.includes(value)}
                                onCheckedChange={() => togglePermission(value)}
                              />
                              <Label 
                                htmlFor={`edit-${value}`} 
                                className="text-sm font-normal cursor-pointer flex-1"
                              >
                                {formatPermissionLabel(key)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setRoleForm({ name: '', permissions: [] });
                setSelectAll(false);
                setEditingRole(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900"
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </InventoryLayout>
  );
}