/**
 * ZIRON / VIREXON BIOSCIENCES — RBAC (Role-Based Access Control) Types
 */

export type AppRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CONTENT_MANAGER'
  | 'COMMUNITY_MANAGER'
  | 'SCHOOL_MANAGER'
  | 'PRODUCT_MANAGER'
  | 'ORDER_MANAGER'
  | 'SUPPORT'
  | 'ANALYST'
  | 'CUSTOMER';

export type AppPermission =
  | 'MANAGE_ALL'
  | 'MANAGE_ADMINS'
  | 'MANAGE_USERS'
  | 'MANAGE_ROLES'
  | 'MANAGE_CMS'
  | 'MANAGE_COMMUNITY'
  | 'MODERATE_COMMUNITY'
  | 'MANAGE_SCHOOL'
  | 'MANAGE_COURSES'
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_CODES'
  | 'MANAGE_ORDERS'
  | 'SUPPORT_TICKETS'
  | 'VIEW_AUDIT_LOGS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_SETTINGS'
  | 'ACCESS_COMMUNITY'
  | 'ACCESS_SCHOOL';

export interface UserRoleAssignment {
  role: AppRole;
  assignedAt: string;
  assignedBy: string;
}
