import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from '../../user/const/user-role.enum';

export const RBAC = Reflector.createDecorator<UserRoleEnum>();
