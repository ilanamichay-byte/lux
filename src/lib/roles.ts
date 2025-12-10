// src/lib/roles.ts

// כל התפקידים האפשריים במערכת
export type UserRole = "BUYER" | "SELLER" | "SELLER_VERIFIED" | "ADMIN";

// סטטוס של בקשת מוכר
export type SellerStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export function isSellerRole(role?: string | null): boolean {
  return role === "SELLER" || role === "SELLER_VERIFIED";
}

export function isAdminRole(role?: string | null): boolean {
  return role === "ADMIN";
}
