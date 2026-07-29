import { BaseService } from '../../../admission/services/BaseService';

export class CGPAEngine extends BaseService {
    public calculateCgpa(gpasList: number[]): number {
        if (!gpasList || gpasList.length === 0) return 0.00;
        const sum = gpasList.reduce((acc, curr) => acc + curr, 0);
        return sum / gpasList.length;
    }
}
export default CGPAEngine;
