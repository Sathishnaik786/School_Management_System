import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';
import { RegistrationController } from './controllers/registration.controller';
import { VenueController } from './controllers/venue.controller';
import { SeatingController } from './controllers/seating.controller';
import { InvigilationController } from './controllers/invigilation.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { PublicationController } from './controllers/publication.controller';
import { SchedulingController } from './controllers/scheduling.controller';

export const examinationOperationsRouter = Router();

// All routes require authentication
examinationOperationsRouter.use(authenticate);

// ==========================================
// CANDIDATE REGISTRATION
// ==========================================
examinationOperationsRouter.get('/registrations', RegistrationController.list);
examinationOperationsRouter.get('/registrations/:id', RegistrationController.get);
examinationOperationsRouter.post('/registrations', RegistrationController.create);
examinationOperationsRouter.post('/registrations/bulk', RegistrationController.bulkRegister);
examinationOperationsRouter.patch('/registrations/:id/status', RegistrationController.updateStatus);
examinationOperationsRouter.post('/registrations/:id/hall-ticket', RegistrationController.generateHallTicket);

// ==========================================
// VENUES: CENTERS / BUILDINGS / ROOMS
// ==========================================
examinationOperationsRouter.get('/venues/centers', VenueController.listCenters);
examinationOperationsRouter.post('/venues/centers', VenueController.createCenter);
examinationOperationsRouter.put('/venues/centers/:id', VenueController.updateCenter);
examinationOperationsRouter.delete('/venues/centers/:id', VenueController.deleteCenter);

examinationOperationsRouter.get('/venues/buildings', VenueController.listBuildings);
examinationOperationsRouter.post('/venues/buildings', VenueController.createBuilding);
examinationOperationsRouter.put('/venues/buildings/:id', VenueController.updateBuilding);

examinationOperationsRouter.get('/venues/rooms', VenueController.listRooms);
examinationOperationsRouter.post('/venues/rooms', VenueController.createRoom);
examinationOperationsRouter.put('/venues/rooms/:id', VenueController.updateRoom);
examinationOperationsRouter.delete('/venues/rooms/:id', VenueController.deleteRoom);

// ==========================================
// SEATING ALLOCATION
// ==========================================
examinationOperationsRouter.get('/seating/allocations', SeatingController.listAllocations);
examinationOperationsRouter.post('/seating/auto-allocate', SeatingController.autoAllocate);
examinationOperationsRouter.patch('/seating/allocations/:id/change', SeatingController.changeSeat);
examinationOperationsRouter.get('/seating/audit-logs', SeatingController.getAuditLogs);

// ==========================================
// INVIGILATION
// ==========================================
examinationOperationsRouter.get('/invigilation/assignments', InvigilationController.listAssignments);
examinationOperationsRouter.post('/invigilation/assignments', InvigilationController.assign);
examinationOperationsRouter.patch('/invigilation/assignments/:id/status', InvigilationController.updateStatus);
examinationOperationsRouter.delete('/invigilation/assignments/:id', InvigilationController.remove);
examinationOperationsRouter.get('/invigilation/availability', InvigilationController.listAvailability);
examinationOperationsRouter.post('/invigilation/availability', InvigilationController.setAvailability);

// ==========================================
// ATTENDANCE
// ==========================================
examinationOperationsRouter.get('/attendance', AttendanceController.listAttendance);
examinationOperationsRouter.post('/attendance/mark', AttendanceController.markAttendance);
examinationOperationsRouter.post('/attendance/scan-qr', AttendanceController.scanQR);
examinationOperationsRouter.post('/attendance/bulk', AttendanceController.bulkMark);

// ==========================================
// RESULT PUBLICATIONS
// ==========================================
examinationOperationsRouter.get('/publications', PublicationController.listPublications);
examinationOperationsRouter.get('/publications/:id', PublicationController.getPublication);
examinationOperationsRouter.post('/publications', PublicationController.initiate);
examinationOperationsRouter.post('/publications/:id/advance', PublicationController.advance);
examinationOperationsRouter.post('/publications/:id/freeze', PublicationController.freeze);

// ==========================================
// SCHEDULING SESSIONS & ROOMS
// ==========================================
examinationOperationsRouter.get('/scheduling/sessions', SchedulingController.listSessions);
examinationOperationsRouter.post('/scheduling/sessions', SchedulingController.createSession);
examinationOperationsRouter.put('/scheduling/sessions/:id', SchedulingController.updateSession);
examinationOperationsRouter.delete('/scheduling/sessions/:id', SchedulingController.deleteSession);

examinationOperationsRouter.get('/scheduling/rooms', SchedulingController.listScheduleRooms);
examinationOperationsRouter.post('/scheduling/rooms', SchedulingController.addScheduleRoom);
examinationOperationsRouter.delete('/scheduling/rooms/:id', SchedulingController.removeScheduleRoom);
