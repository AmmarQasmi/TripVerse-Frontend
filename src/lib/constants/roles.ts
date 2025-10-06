export const USER_ROLES = {
  CLIENT: 'CLIENT',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const ROLE_PERMISSIONS = {
  [USER_ROLES.CLIENT]: [
    'hotel:read',
    'hotel:book',
    'car:read',
    'car:book',
    'monument:read',
    'monument:recognize',
    'weather:read',
    'booking:read:own',
    'payment:create',
  ],
  [USER_ROLES.DRIVER]: [
    'hotel:read',
    'car:read',
    'car:create',
    'car:update:own',
    'car:delete:own',
    'booking:read:own',
    'booking:update:own',
    'payout:read:own',
  ],
  [USER_ROLES.ADMIN]: [
    'user:read',
    'user:update',
    'user:delete',
    'driver:verify',
    'hotel:create',
    'hotel:update',
    'hotel:delete',
    'car:read',
    'car:update',
    'car:delete',
    'booking:read',
    'booking:update',
    'booking:cancel',
    'payment:read',
    'payment:refund',
    'dispute:read',
    'dispute:resolve',
  ],
} as const

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return (permissions as string[]).includes(permission)
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, string[]> = {
    '/(client)/hotels': ['hotel:read'],
    '/(client)/cars': ['car:read'],
    '/(client)/bookings': ['booking:read:own'],
    '/(client)/monuments': ['monument:read', 'monument:recognize'],
    '/(client)/weather': ['weather:read'],
    '/(driver)/dashboard': ['car:read'],
    '/(driver)/cars': ['car:create', 'car:update:own', 'car:delete:own'],
    '/(driver)/bookings': ['booking:read:own', 'booking:update:own'],
    '/(driver)/payouts': ['payout:read:own'],
    '/(admin)/dashboard': ['user:read'],
    '/(admin)/drivers': ['driver:verify'],
    '/(admin)/payments': ['payment:read'],
    '/(admin)/disputes': ['dispute:read', 'dispute:resolve'],
  }

  const requiredPermissions = routePermissions[route] || []
  return requiredPermissions.some(permission => hasPermission(role, permission))
}
