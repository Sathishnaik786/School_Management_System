// DTO definitions for Calendar module
// Using class-validator for runtime validation (assumes library is installed)
import { IsString, IsUUID, IsOptional, IsArray, IsDateString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAcademicCalendarDto {
  @IsUUID()
  school_id: string;

  @IsString()
  name: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateAcademicCalendarDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class PublishCalendarDto {
  @IsString()
  reason: string; // optional reason for audit log
}

export class LockCalendarDto {
  @IsString()
  reason: string;
}

export class ResolveConflictDto {
  @IsEnum(['INFO','WARNING','ERROR','CRITICAL'])
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

  @IsString()
  resolution_notes: string;
}
