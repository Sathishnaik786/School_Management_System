import { StudentProvisionRepository } from '../../repositories/enrollment/StudentProvisionRepository';
import { StudentProvision } from '../../domain/enrollment/StudentProvision';
import { StudentMasterProvisioner } from './provisioning/StudentMasterProvisioner';
import { AcademicProvisioner } from './provisioning/AcademicProvisioner';
import { ParentProvisioner } from './provisioning/ParentProvisioner';
import { UserProvisioner } from './provisioning/UserProvisioner';
import { TransportProvisioner } from './provisioning/TransportProvisioner';
import { HostelProvisioner } from './provisioning/HostelProvisioner';
import { LibraryProvisioner } from './provisioning/LibraryProvisioner';
import { IDCardProvisioner } from './provisioning/IDCardProvisioner';
import { ApplicationRepository } from '../../repositories/application/ApplicationRepository';

export class StudentProvisionService {
    constructor(
        private readonly provisionRepo: StudentProvisionRepository,
        private readonly appRepo: ApplicationRepository,
        private readonly studentProvisioner: StudentMasterProvisioner,
        private readonly academicProvisioner: AcademicProvisioner,
        private readonly parentProvisioner: ParentProvisioner,
        private readonly userProvisioner: UserProvisioner,
        private readonly transportProvisioner: TransportProvisioner,
        private readonly hostelProvisioner: HostelProvisioner,
        private readonly libraryProvisioner: LibraryProvisioner,
        private readonly idCardProvisioner: IDCardProvisioner
    ) {}

    /**
     * Provisions the candidate into student master databases.
     */
    public async provisionStudent(
        applicationId: string,
        admissionNumber: string
    ): Promise<string> {
        // Fetch candidate details
        const profile = await this.appRepo.findProfile(applicationId);
        const app = await this.appRepo.findById(applicationId);
        if (!app) {
            throw new Error(`Application with ID ${applicationId} not found`);
        }

        const steps = ['Student', 'Academic', 'Parent', 'User', 'Transport', 'Hostel', 'Library', 'IDCard'];
        const jobs = await this.provisionRepo.findJobsByApplicationId(applicationId);

        // 1. Initialise jobs tracking
        for (const step of steps) {
            let job = jobs.find(j => j.stepName === step);
            if (!job) {
                job = new StudentProvision(
                    crypto.randomUUID(),
                    applicationId,
                    step,
                    'PENDING',
                    null,
                    new Date(),
                    new Date()
                );
                await this.provisionRepo.saveJob(job);
            }
        }

        let studentId = '';
        try {
            // Step 1: Student core record creation
            const studentJob = new StudentProvision(crypto.randomUUID(), applicationId, 'Student', 'PROCESSING', null, new Date(), new Date());
            await this.provisionRepo.saveJob(studentJob);

            const studentProfileObj = {
                student_name: profile ? 'Enrolled Student' : 'Student Name',
                date_of_birth: profile ? profile.dateOfBirth.toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
                gender: profile ? profile.gender : 'Other',
                school_id: app.schoolId,
                academic_year_id: app.academicYearId
            };
            studentId = await this.studentProvisioner.provision(applicationId, admissionNumber, studentProfileObj);
            studentJob.complete();
            await this.provisionRepo.saveJob(studentJob);

            // Step 2: Academic enrollment
            const acadJob = new StudentProvision(crypto.randomUUID(), applicationId, 'Academic', 'PROCESSING', null, new Date(), new Date());
            await this.provisionRepo.saveJob(acadJob);
            const grade = await this.appRepo.getGradeForApplication(applicationId);
            await this.academicProvisioner.provision(studentId, grade, app.academicYearId);
            acadJob.complete();
            await this.provisionRepo.saveJob(acadJob);

            // Step 3: Parent Mapping
            const parentJob = new StudentProvision(crypto.randomUUID(), applicationId, 'Parent', 'PROCESSING', null, new Date(), new Date());
            await this.provisionRepo.saveJob(parentJob);
            await this.parentProvisioner.provision(studentId, applicationId);
            parentJob.complete();
            await this.provisionRepo.saveJob(parentJob);

            // Step 4: User Account
            const userJob = new StudentProvision(crypto.randomUUID(), applicationId, 'User', 'PROCESSING', null, new Date(), new Date());
            await this.provisionRepo.saveJob(userJob);
            await this.userProvisioner.provision(admissionNumber, 'parent@school.com');
            userJob.complete();
            await this.provisionRepo.saveJob(userJob);

            // Step 5: Transport Allocation
            const transJob = new StudentProvision(crypto.randomUUID(), applicationId, 'Transport', 'PROCESSING', null, new Date(), new Date());
            await this.provisionRepo.saveJob(transJob);
            await this.transportProvisioner.provision(studentId, applicationId);
            transJob.complete();
            await this.provisionRepo.saveJob(transJob);

            // Step 6: Hostel Allocation
            const hostelJob = new StudentProvision(crypto.randomUUID(), applicationId, 'Hostel', 'PROCESSING', null, new Date(), new Date());
            await this.provisionRepo.saveJob(hostelJob);
            await this.hostelProvisioner.provision(studentId);
            hostelJob.complete();
            await this.provisionRepo.saveJob(hostelJob);

            // Step 7: Library account
            const libJob = new StudentProvision(crypto.randomUUID(), applicationId, 'Library', 'PROCESSING', null, new Date(), new Date());
            await this.provisionRepo.saveJob(libJob);
            await this.libraryProvisioner.provision(studentId, admissionNumber);
            libJob.complete();
            await this.provisionRepo.saveJob(libJob);

            // Step 8: ID Card
            const idCardJob = new StudentProvision(crypto.randomUUID(), applicationId, 'IDCard', 'PROCESSING', null, new Date(), new Date());
            await this.provisionRepo.saveJob(idCardJob);
            await this.idCardProvisioner.provision(studentId, admissionNumber);
            idCardJob.complete();
            await this.provisionRepo.saveJob(idCardJob);

        } catch (err: any) {
            // Fail jobs tracking
            const failedJobs = await this.provisionRepo.findJobsByApplicationId(applicationId);
            for (const job of failedJobs) {
                if (job.status !== 'COMPLETED') {
                    job.fail(err.message || 'ERP provisioning step failed');
                    await this.provisionRepo.saveJob(job);
                }
            }
            throw err;
        }

        return studentId;
    }
}
