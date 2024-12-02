import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/users/decorators/user-roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles: string[] = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user as User;

    if (!user) {
      throw new BadRequestException('No user found');
    }

    const hasRole = roles.some((role) => user.role.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('No tiene permisos suficientes');
    }

    return hasRole;
  }
}
