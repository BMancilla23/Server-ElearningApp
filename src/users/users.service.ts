import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Redis } from '@upstash/redis';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PasswordUserDto } from './dto/password-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyOtpUserDto } from './dto/verifyotp-user.dto';
import { IPayload } from './interfaces/payload.interface';
import { IUserProfile } from './interfaces/userProfile.interface';
import { User } from './schemas/user.schema';

// Casos de uso con Redis
// 1. Almacenamiento de OTP y su expiración
// 2. Almacenamiento de tokens de acceso y refresco
// 3. Control de intentos de inicip de sesión o reenvío de OTP
// 4. Caché de datos de usuario

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly usersRepository: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // Verificamos si el email ya existe
    const isEmailExist = await this.usersRepository.findOne({ email });
    if (isEmailExist) {
      throw new BadRequestException('Email already exists');
    }

    // Hasheamos la contraseña
    const hashedPassword = await argon2.hash(password);

    if (!hashedPassword) {
      throw new NotFoundException('Password not found');
    }

    // Generar OTP
    const otp: string = this.generateOtp();
    // Hasheamos el OTP
    const hashedOtp = await argon2.hash(otp);

    // Guardamos el OTP en Redis
    /*  const OTP_EXPIRES_IN = 1000 * 60 * 5; */ // 5 minutos de expiración
    const OTP_EXPIRES_IN_SECONDS = 300; // 5 minutos de expiración
    // Guardamos el OTP en Redis como uua cadena
    await this.redisClient.set(`otp:${email}`, `${hashedOtp}`, {
      ex: OTP_EXPIRES_IN_SECONDS,
    });

    // Creamos el usuario
    const user = await this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      /* otpHash,
      otpExpiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutos de expiración */
    });

    // Generamos el token
    const accessToken = this.generateToken({
      id: user._id.toString(),
      role: user.role,
    });

    // Generamos el refresh token
    const refreshToken = this.generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    // Enviar OTP por email
    await this.mailService.sendEmail(email, 'Verify your email', 'otp', {
      name: user.name,
      otp,
    });

    // Devolvemos el usuario y el token
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Verificamos si el usuario existe
    const user = await this.usersRepository.findOne({ email }, '+password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificamos la contraseña
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }
    // Generamos el token
    const accessToken = this.generateToken({
      id: user._id.toString(),
      role: user.role,
    });
    // Generamos el refresh token
    const refreshToken = this.generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    // Devolvemos el usuario y el token
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async verifyOtp(email: string, verifyOtpUserDto: VerifyOtpUserDto) {
    const { otp } = verifyOtpUserDto;

    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    /* console.log(otp); */

    // Obtenemos el OTP almacenado en Redis

    const storedOtp: string = await this.redisClient.get(`otp:${email}`);

    /*  console.log(storedOtp); */

    if (!storedOtp || !(await argon2.verify(storedOtp, otp))) {
      throw new NotFoundException('Otp not valid');
    }

    // Borramos el OTP almacenado en Redis
    await this.redisClient.del(`otp:${email}`);

    // console.log(user);

    /*  if (!user.otpHash || new Date() > user.otpExpiresAt) {
      throw new NotFoundException('Otp expired or not generated');
    }

    const isOtpValid = await argon2.verify(user.otpHash, otp);

    if (!isOtpValid) {
      throw new NotFoundException('Otp not valid');
    } */

    // Borramos el hash y la fecha de expiración

    /*   user.otpHash = undefined;
    user.otpExpiresAt = undefined; */

    // Marcamos el usuario como verificado
    user.isVerified = true;

    await user.save();

    return {
      message: 'Otp verificado correctamente',
    };
  }

  async resendOtp(email: string) {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verifica si ya existe un OTP válido
    /* if (user.otpExpiresAt && new Date() < user.otpExpiresAt) {
      throw new NotFoundException('An active OTP already exists');
    } */

    const storeOtp = await this.redisClient.get(`otp:${email}`);

    /* if (storeOtp) {
      throw new NotFoundException(
        'An active OTP already exists. Please wait before requesting a new one.',
      );
    } */

    // Verifica si el OTP está activo y si tiene una fecha de expiración
    const ttl = await this.redisClient.ttl(`otp:${email}`);
    if (storeOtp && ttl > 0) {
      throw new NotFoundException(
        `An active OTP already exists. Please wait ${ttl} seconds before requesting a new one.`,
      );
    }

    // Generar un nuevo OTP
    const otp = this.generateOtp();
    /*   const otpHash = await argon2.hash(otp);

    // Actualizar los valores en la base de datos
    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 1000 * 60 * 5); */

    /*  await user.save(); */
    // Guardamos el OTP en Redis con un tiempo de expiración
    const OTP_EXPIRES_IN_SECONDS = 300; // 5 minutos de expiración
    await this.redisClient.set(`otp:${email}`, otp, {
      ex: OTP_EXPIRES_IN_SECONDS,
    });

    // Enviar OTP por email
    await this.mailService.sendEmail(email, 'Verify your email', 'otp', {
      name: user.name,
      otp,
    });

    /*  console.log(user); */

    return {
      message: 'un nuevo otp fue generado',
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    // Validamos el payload del token
    const verifyToken = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('jwt.secret'),
    });

    if (!verifyToken) {
      throw new UnauthorizedException('Token invalid');
    }

    // Buscamos el usuario en la base de datos
    const user = await this.usersRepository.findOne({
      _id: userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generamos un nuevo token
    const newRefreshToken = this.generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    return { newRefreshToken };
  }

  // Método para autenticar usuarios con proveedores sociales
  async socialAuth(profile: IUserProfile) {
    // Extraemos datos del perfil social
    const { provider, providerId, email, name, picture } = profile;

    if (!email) {
      throw new NotFoundException('Email is required from the provider');
    }

    let user = await this.usersRepository.findOne({ email }, '+socialId');

    if (!user) {
      user = await this.usersRepository.create({
        name,
        email,
        avatar: picture,
        provider: provider,
        socialId: providerId,
        isVerified: true,
      });
    }

    // Generamos tokens
    const accessToken = this.generateToken({
      id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    return { accessToken, refreshToken, user };
  }

  async getUserProfile(id: string) {
    // Buscamos el usuario en la base de datos
    const user = await this.usersRepository.findById(id);
    return user;
  }

  async updateUserProfile(id: string, updateUserDto: UpdateUserDto) {
    // Buscamos el usuario en la base de datos
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Actualizamos los datos del usuario
    user.name = updateUserDto.name;

    await user.save();

    return user;
  }

  async updateAvatarProfile(userId: string, file: Express.Multer.File) {
    try {
      // Validamos que el archivo sea un archivo de imagen
      if (!file || !file.buffer) {
        throw new BadRequestException('Invalid file or file buffer is missing');
      }

      console.log('Archivo recibido', file);

      // Buscamos el usuario en la base de datos
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      /* if (user.avatar) {
        const previousAvatarPublicId = this.getPublicIdFromUrl(user.avatar);
        await this.cloudinaryService.deleteImage(previousAvatarPublicId);
        console.log('Avatar eliminado:', previousAvatarPublicId);
      } */

      // Si existe un avatar previo, elimínalo
      if (user.avatar?.public_id) {
        await this.cloudinaryService.deleteImage(user.avatar.public_id);
      }

      // Procesamos la imagen y la redimensionamos
      const proccededBuffer = await this.cloudinaryService.resizeAndOptimize(
        file.buffer,
        500,
        500,
        'webp',
        'cover',
      );

      // Subimos el archivo a Cloudinary
      const uploadResult = await this.cloudinaryService.uploadStream(
        proccededBuffer,
        {
          folder: 'avatars',
        },
      );

      console.log(uploadResult);

      if (!uploadResult || !uploadResult.secure_url) {
        throw new InternalServerErrorException(
          'Failed to upload avatar to Cloudinary',
        );
      }
      // Actualizamos el usuario en la base de datos

      /* user.avatar = uploadResult.secure_url; */
      user.avatar = {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      };

      await user.save();

      // Retornamos la URL del archivo subido
      return {
        message: 'Avatar updated successfully',
        avatar: user.avatar.url,
      };
    } catch (error) {
      console.error('Error al actualizar el avatar:', error.message);
      throw new InternalServerErrorException('Error updating avatar', error);
    }
  }

  async updatePassword(userId: string, passwordUserDto: PasswordUserDto) {
    // Extraemos los datos validatos del dto
    const { oldPassword, newPassword } = passwordUserDto;

    // Buscamos el usuario en la base de datos
    const user = await this.usersRepository.findById(userId, '+password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificamos la contraseña actual
    const isPasswordValid = await argon2.verify(user.password, oldPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Actualizamos la contraseña
    user.password = await argon2.hash(newPassword);

    await user.save();

    return {
      message: 'Password updated successfully',
    };
  }

  // Método para generar un token
  private generateToken(payload: IPayload) {
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }

  // Método para generar un refresh token
  private generateRefreshToken(payload: IPayload) {
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    return refreshToken;
  }

  // Método para generar un número aleatorio entre 1000 y 8999
  private generateOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
    return otp.toString();
  }

  /* private getPublicIdFromUrl(url: string) {
    const regex = /\/v(\d+)\/(.*)\.([a-z0-9]{3,4})$/;
    const match = url.match(regex);
    if (match && match[2]) {
      return match[2]; // Esto devuelve el public_id
    }
    throw new Error('Invalid Cloudinary URL');
  } */
}
