import { Request, Response, NextFunction } from 'express';
import CalendarService from '../services/CalendarService';
import { validateCreateAcademicCalendar, validateUpdateAcademicCalendar, validatePublishCalendar, validateLockCalendar, validateResolveConflict } from '../validators/CalendarValidator';

class CalendarController {
  private service: CalendarService;

  constructor() {
    this.service = new CalendarService();
    // Bind methods
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.get = this.get.bind(this);
    this.list = this.list.bind(this);
    this.publish = this.publish.bind(this);
    this.lock = this.lock.bind(this);
    this.getVersionHistory = this.getVersionHistory.bind(this);
    this.restoreVersion = this.restoreVersion.bind(this);
    this.detectConflicts = this.detectConflicts.bind(this);
    this.resolveConflict = this.resolveConflict.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = await validateCreateAcademicCalendar(req.body);
      const result = await this.service.createCalendar(payload, req.user.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payload = await validateUpdateAcademicCalendar(req.body);
      const result = await this.service.updateCalendar(id, payload, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.service.deleteCalendar(id, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const calendar = await this.service.getCalendar(id);
      res.json(calendar);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', search, sortBy, sortOrder, status, schoolId } = req.query as any;
      const result = await this.service.listCalendars({ page: Number(page), limit: Number(limit), search, sortBy, sortOrder, status, schoolId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payload = await validatePublishCalendar(req.body);
      const result = await this.service.publishCalendar(id, payload, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async lock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payload = await validateLockCalendar(req.body);
      const result = await this.service.lockCalendar(id, payload, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getVersionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const history = await this.service.getVersionHistory(id);
      res.json(history);
    } catch (err) {
      next(err);
    }
  }

  async restoreVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, versionId } = req.params;
      const result = await this.service.restoreVersion(id, versionId, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async detectConflicts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const conflicts = await this.service.detectConflicts(id);
      res.json(conflicts);
    } catch (err) {
      next(err);
    }
  }

  async resolveConflict(req: Request, res: Response, next: NextFunction) {
    try {
      const { conflictId } = req.params;
      const payload = await validateResolveConflict(req.body);
      const result = await this.service.resolveConflict(conflictId, payload, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default CalendarController;
