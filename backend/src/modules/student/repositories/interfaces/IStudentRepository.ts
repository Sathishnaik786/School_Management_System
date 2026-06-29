import { Student } from '../../domain/Student';
import { StudentProfile } from '../../domain/StudentProfile';
import { StudentParent } from '../../domain/StudentParent';

export interface IStudentRepository {
    findById(id: string): Promise<Student | null>;
    findByAdmissionNo(admissionNo: string): Promise<Student | null>;
    save(student: Student): Promise<void>;
    
    findProfile(studentId: string): Promise<StudentProfile | null>;
    saveProfile(profile: StudentProfile): Promise<void>;
    
    findParents(studentId: string): Promise<StudentParent[]>;
    saveParent(parent: StudentParent): Promise<void>;
}
