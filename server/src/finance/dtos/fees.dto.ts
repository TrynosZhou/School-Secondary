import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FeesNames } from '../models/fees-names.enum';

export class CreateFeesDto {
  @ApiProperty()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsEnum(FeesNames)
  @IsNotEmpty()
  name: FeesNames;
}
