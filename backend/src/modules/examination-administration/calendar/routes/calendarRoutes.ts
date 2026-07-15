import { Router } from 'express';
import CalendarController from '../controllers/CalendarController';
import { authenticate } from '../../../auth/authenticate';
import { checkPermission } from '../../../auth/checkPermission';

const router = Router();
const controller = new CalendarController();

// Middleware to enforce authentication and permission per route
const require = (permission: string) => [authenticate, checkPermission(permission)];

// CRUD
router.post('/', ...require('exam.admin.calendar.create'), controller.create);
router.put('/:id', ...require('exam.admin.calendar.update'), controller.update);
router.delete('/:id', ...require('exam.admin.calendar.delete'), controller.delete);
router.get('/:id', ...require('exam.admin.calendar.view'), controller.get);
router.get('/', ...require('exam.admin.calendar.view'), controller.list);

// Publish & Lock
router.post('/:id/publish', ...require('exam.admin.calendar.publish'), controller.publish);
router.post('/:id/lock', ...require('exam.admin.calendar.lock'), controller.lock);

// Version history
router.get('/:id/versions', ...require('exam.admin.calendar.version.view'), controller.getVersionHistory);
router.post('/:id/versions/:versionId/restore', ...require('exam.admin.calendar.version.restore'), controller.restoreVersion);

// Conflict detection & resolution
router.get('/:id/conflicts', ...require('exam.admin.calendar.conflicts.view'), controller.detectConflicts);
router.post('/conflicts/:conflictId/resolve', ...require('exam.admin.calendar.conflicts.resolve'), controller.resolveConflict);

export default router;
