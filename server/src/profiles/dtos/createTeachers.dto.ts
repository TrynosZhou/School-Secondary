import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ROLES } from 'src/auth/models/roles.enum';

export class CreateTeacherDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  surname: string;

  @ApiProperty()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value || undefined,
  )
  @IsDateString()
  @IsOptional()
  dob?: Date;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value || undefined,
  )
  @IsDateString()
  @IsOptional()
  dateOfJoining?: Date;

  @ApiProperty()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim().length > 0) return [value];
    return [];
  })
  @IsArray()
  qualifications: string[];

  @ApiProperty()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  active: boolean;

  @ApiProperty()
  @IsString()
  // @IsPhoneNumber()
  cell: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value || undefined,
  )
  @IsDateString()
  dateOfLeaving?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  role?: ROLES;
}
