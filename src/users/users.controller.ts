import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { fileValidators } from 'src/common/helpers/file-validators';
import { Auth } from './decorators';
import { GetUser } from './decorators/get-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PasswordUserDto } from './dto/password-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyOtpUserDto } from './dto/verifyotp-user.dto';
import { FacebookOauthGuard } from './guards/facebook-oauth/facebook-oauth.guard';
import { GoogleOauthGuard } from './guards/google-oauth/google-oauth.guard';
import { RefreshTokenGuard } from './guards/refresh-token/refresh-token.guard';
import { IUserProfile } from './interfaces/userProfile.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.usersService.register(createUserDto);
    // Guardamos el refresh token en la cookie
    this.setRefreshTokenCookie(res, refreshToken);

    return res.json({ user, accessToken });
  }

  @Post('auth/login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.usersService.login(loginUserDto);

    // Guardamos el refresh token en la cookie
    this.setRefreshTokenCookie(res, refreshToken);

    return res.json({ user, accessToken });
  }

  @Post('auth/verify-otp')
  @Auth()
  async verifyOtp(
    @GetUser('email') email: string,
    @Body() verifyOtpUserDto: VerifyOtpUserDto,
  ) {
    return this.usersService.verifyOtp(email, verifyOtpUserDto);
  }

  @Post('auth/resend-otp')
  @Auth()
  async resendOtp(@GetUser('email') email: string) {
    return this.usersService.resendOtp(email);
  }

  @Get('auth/refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @GetUser('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const { newRefreshToken } = await this.usersService.refreshToken(
      id,
      refreshToken,
    );

    // Guardamos el refresh token en la cookie
    this.setRefreshTokenCookie(res, refreshToken);

    return res.json({
      newRefreshToken,
    });
  }

  @Get('auth/facebook')
  @UseGuards(FacebookOauthGuard)
  async facebookOauth() {
    return {
      http: HttpStatus.OK,
      message: 'Facebook oauth success',
    };
  }

  @Get('auth/facebook/callback')
  @UseGuards(FacebookOauthGuard)
  async facebookRedirect(@GetUser() user: IUserProfile, @Res() res: Response) {
    if (!user) {
      throw new UnauthorizedException('No user found');
    }

    console.log(user);

    // Procesamos los datos del usuario autenticado
    const {
      accessToken,
      refreshToken,
      user: userData,
    } = await this.usersService.socialAuth(user);

    // Guardamos el refresh token en la cookie
    this.setRefreshTokenCookie(res, refreshToken);

    // Redirigimos al cliente con los tokens o mostramos una respueta
    return res.json({
      accessToken,
      refreshToken,
      userData,
    });
  }

  @Get('auth/google')
  @UseGuards(GoogleOauthGuard)
  async googleOauth() {
    return {
      http: HttpStatus.OK,
      message: 'Google oauth success',
    };
  }

  @Get('auth/google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleRedirect(@GetUser() user: IUserProfile, @Res() res: Response) {
    if (!user) {
      throw new UnauthorizedException('No user found');
    }
    console.log(user);

    // Procesamos los datos del usuario autenticado
    const {
      accessToken,
      refreshToken,
      user: userData,
    } = await this.usersService.socialAuth(user);

    // Guardamos el refresh token en la cookie
    this.setRefreshTokenCookie(res, refreshToken);

    // Redirigimos al cliente con los tokens o mostramos una respueta
    return res.json({
      accessToken,
      refreshToken,
      userData,
    });
  }

  // Cerrar sesión
  @Get('auth/logout')
  @Auth()
  async logout(@Req() req: Request, @Res() res: Response) {
    // Borramos el refresh token de la cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });

    return res.json({
      message: 'You have been logged out',
    });
  }

  // Obtener el perfil del usuario
  @Get('auth/profile')
  @Auth()
  async getUserProfile(@GetUser('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  // Actualizar el perfil del usuario
  @Patch('auth/edit-profile')
  @Auth()
  async updateUserProfile(
    @GetUser('id') id: string,
    @Body() updateUserDto: Omit<UpdateUserDto, 'email | password'>,
  ) {
    return this.usersService.updateUserProfile(id, updateUserDto);
  }

  // Actualizar la contraseña del usuario
  @Patch('auth/edit-password')
  @Auth()
  async updatePassword(
    @GetUser('id') id: string,
    @Body() passwordUserDto: PasswordUserDto,
  ) {
    return this.usersService.updatePassword(id, passwordUserDto);
  }

  // Actualizar el avatar del usuario con multer
  @Patch('auth/edit-avatar')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @GetUser('id') id: string,
    @UploadedFile(fileValidators)
    file: Express.Multer.File,
  ) {
    /*   console.log(file); */

    return this.usersService.updateAvatarProfile(id, file);
  }

  setRefreshTokenCookie(@Res() res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Cambiar a true en producción para evitar ataques CSRF
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });
  }
}
