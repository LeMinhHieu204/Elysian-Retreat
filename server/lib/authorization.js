import { DomainError } from './domain.js';

export const adminRoles = Object.freeze([
  'super_admin',
  'hotel_manager',
  'front_desk',
  'reservations_staff',
  'housekeeping',
  'content_editor'
]);

export const dashboardReadRoles = Object.freeze([
  'super_admin',
  'hotel_manager',
  'front_desk',
  'reservations_staff'
]);

export function requireRole(session, roles) {
  if (!session || !roles.includes(session.role)) {
    throw new DomainError('FORBIDDEN', 'Your staff role cannot perform this operation.', 403);
  }
}
