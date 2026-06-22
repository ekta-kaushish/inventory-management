import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('Admin' | 'Staff')[]) => SetMetadata(ROLES_KEY, roles);
