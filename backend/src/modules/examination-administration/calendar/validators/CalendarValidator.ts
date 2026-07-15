import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateAcademicCalendarDto, UpdateAcademicCalendarDto, PublishCalendarDto, LockCalendarDto, ResolveConflictDto } from '../dto/CalendarDto';

export async function validateCreateAcademicCalendar(payload: any) {
  const dto = plainToInstance(CreateAcademicCalendarDto, payload);
  await validateOrReject(dto);
  return dto;
}

export async function validateUpdateAcademicCalendar(payload: any) {
  const dto = plainToInstance(UpdateAcademicCalendarDto, payload);
  await validateOrReject(dto);
  return dto;
}

export async function validatePublishCalendar(payload: any) {
  const dto = plainToInstance(PublishCalendarDto, payload);
  await validateOrReject(dto);
  return dto;
}

export async function validateLockCalendar(payload: any) {
  const dto = plainToInstance(LockCalendarDto, payload);
  await validateOrReject(dto);
  return dto;
}

export async function validateResolveConflict(payload: any) {
  const dto = plainToInstance(ResolveConflictDto, payload);
  await validateOrReject(dto);
  return dto;
}
