import { createQuestionSchema } from '../dto/question.dto';
import { createFolderSchema } from '../dto/folder.dto';
import { ImportExportService } from '../services/import-export.service';

console.log('--- Running Assessment Question Bank Tests (Phase 2) ---');
let passed = 0;
let failed = 0;

const assert = (condition: boolean, testName: string) => {
    if (condition) {
        console.log(`[PASS] ${testName}`);
        passed++;
    } else {
        console.error(`[FAIL] ${testName}`);
        failed++;
    }
};

async function runTests() {
    // 1. Folders Schema validation
    try {
        const validFolder = { name: 'Algebra 101', parent_id: '990b7888-f25a-49d7-b224-15c0fd0db490' };
        assert(createFolderSchema.safeParse(validFolder).success === true, 'Folder schema validates correct fields');

        const invalidFolder = { name: '' };
        assert(createFolderSchema.safeParse(invalidFolder).success === false, 'Folder schema catches empty name input');
    } catch (e: any) {
        assert(false, `Folder schemas error: ${e.message}`);
    }

    // 2. Questions Schema validation
    try {
        const validMcq = {
            academic_year_id: '990b7888-f25a-49d7-b224-15c0fd0db490',
            subject_id: '990b7888-f25a-49d7-b224-15c0fd0db490',
            question_text: 'What is 5 + 5?',
            question_type: 'MCQ',
            difficulty: 'EASY',
            bloom_level: 'REMEMBER',
            points: 1,
            negative_marks: 0,
            options: [
                { option_text: '10', is_correct: true },
                { option_text: '20', is_correct: false }
            ],
            taxonomy_tags: ['math', 'addition']
        };
        assert(createQuestionSchema.safeParse(validMcq).success === true, 'Question schema validates valid MCQs');

        const invalidMcq = {
            question_text: '',
            question_type: 'MCQ'
            // Missing required UUID foreign keys
        };
        assert(createQuestionSchema.safeParse(invalidMcq).success === false, 'Question schema rejects missing UUID dependencies');
    } catch (e: any) {
        assert(false, `Question schemas error: ${e.message}`);
    }

    // 3. Standalone CSV Parsing tests
    try {
        const importService = new ImportExportService();
        
        // Mock CSV contents
        const validCsv = `question_text,question_type,points,difficulty,bloom_level,options_text,correct_options
Solve for x: x+2=6,MCQ,2,EASY,APPLY,2|4|6,1
True or False: Mars is red,TRUE_FALSE,1,EASY,REMEMBER,True|False,0`;

        const schoolId = 'school-1';
        const userId = 'user-1';
        const yearId = '990b7888-f25a-49d7-b224-15c0fd0db490';
        const subjectId = '990b7888-f25a-49d7-b224-15c0fd0db490';

        // Mock QuestionService creation logic inside the import loop to test parser integration
        // We will call a parser parseCsvLine directly to assert correct splitting behavior
        const line1 = 'Solve for x: x+2=6,MCQ,2,EASY,APPLY,"2|4|6",1';
        const parsed = (importService as any).parseCsvLine(line1);
        assert(parsed[0] === 'Solve for x: x+2=6', 'CSV parser splits simple strings correctly');
        assert(parsed[5] === '2|4|6', 'CSV parser handles double-quoted strings accurately');
    } catch (e: any) {
        assert(false, `CSV parser testing error: ${e.message}`);
    }

    console.log(`\nAssessment Question Bank Tests Finished: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
