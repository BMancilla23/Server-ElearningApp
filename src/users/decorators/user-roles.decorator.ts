import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

// Esta función se utiliza para definir los roles de un controlador o método en la metadata
export const UserRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
