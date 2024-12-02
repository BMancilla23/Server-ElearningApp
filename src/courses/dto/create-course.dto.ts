import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateSectionDto } from 'src/sections/dto/create-section.dto';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  description: string;

  @IsNotEmpty()
  @MinLength(3)
  @IsEnum(['beginner', 'intermediate', 'advanced'], { each: true })
  level: string;

  @IsOptional()
  @IsObject()
  thumbnail: object;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  category: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections: CreateSectionDto[];
}
