import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
       {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com"
      },
     {
        protocol: "http",
        hostname: "localhost", 
        port: "5002",         
        pathname: "/uploads/**", 
      },
      {
        protocol: "https",
        hostname: "api.bmtpossystem.com",
        pathname: "/uploads/**",
      }
    ]
  }
  /* config options here */
};

export default nextConfig;
