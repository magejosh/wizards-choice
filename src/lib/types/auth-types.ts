// src/lib/types/auth-types.ts
// Authentication related types

/**
 * User authentication model
 */
export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  email: string;
} 