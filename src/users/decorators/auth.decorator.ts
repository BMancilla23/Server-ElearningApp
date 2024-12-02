import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../enums/role.enum';
import { UserRolesGuard } from '../guards/user-roles/user-roles.guard';
import { UserRoles } from './user-roles.decorator';

//Verified

export function Auth(...roles: Role[]) {
  return applyDecorators(
    UseGuards(AuthGuard(), UserRolesGuard),
    UserRoles(...roles),
  );
}
