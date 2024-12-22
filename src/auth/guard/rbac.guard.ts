import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC } from '../decorator/rbac.decorator';
import { UserRoleEnum } from '../../user/const/user-role.enum';

@Injectable()
export class RBACGuard implements CanActivate {
  private readonly userRoleHierarchy: Record<UserRoleEnum, UserRoleEnum[]> = {
    [UserRoleEnum.ADMIN]: [UserRoleEnum.ADMIN, UserRoleEnum.PAID_USER, UserRoleEnum.USER],
    [UserRoleEnum.PAID_USER]: [UserRoleEnum.PAID_USER, UserRoleEnum.USER],
    [UserRoleEnum.USER]: [],
  };
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<UserRoleEnum>(RBAC, context.getHandler());
    if (!Object.values(UserRoleEnum).includes(role)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      return false;
    }

    return this.hasRequiredRoles(user.role, role);
  }

  hasRequiredRoles(userRole: UserRoleEnum, requiredRole: UserRoleEnum) {
    const roleHierarchy = this.userRoleHierarchy[userRole];
    return roleHierarchy.includes(requiredRole);
  }
}
