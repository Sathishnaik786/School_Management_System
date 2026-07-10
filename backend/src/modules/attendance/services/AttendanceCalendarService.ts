import { BaseService } from '../../admission/services/BaseService';
import { AttendanceCalendarRepository } from '../repositories/AttendanceCalendarRepository';

export class AttendanceCalendarService extends BaseService {
    private readonly repo = new AttendanceCalendarRepository();

    public async registerCalendarDay(
        calendarId: string,
        dayDate: string,
        dayType: 'WORKING' | 'HOLIDAY' | 'SPECIAL' | 'MAKEUP',
        remarks?: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Setting attendance calendar day settings for ${dayDate}: type=${dayType}`, correlationId);

        return this.repo.setCalendarDay(calendarId, {
            day_date: dayDate,
            day_type: dayType,
            remarks
        });
    }
}
export default AttendanceCalendarService;
