export type Admin = {
  admin_id: string;
  full_name: string;
  email: string;
  password: string;
  isVerified: boolean;
};

export type OTP = {
  id: string;
  entity_id: string;
  entity_type: "Admin" | "User" | "Vendor";
  otp: string;
  purpose: string;
  expires_at: Date;
  attempts: number;
};

export const otps: OTP[] = [];


export const admins: Admin[] = [
  {
    admin_id: "1",
    full_name: "Super Admin",
    email: "admin@example.com",
    password: "password123", 
    isVerified: true,
  },
];


