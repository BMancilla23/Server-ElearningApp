import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // Obtenemos la request
    const request = ctx.switchToHttp().getRequest();
    // Obtenemos el usuario de la request
    const user = request.user;
    /*  console.log(user); */

    if (!user) {
      throw new NotFoundException('No user found');
    }
    // Si no se especificó el campo, devolvemos el objeto completo
    return data ? user[data] : user;
  },
);
