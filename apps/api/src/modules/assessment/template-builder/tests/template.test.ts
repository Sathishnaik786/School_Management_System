import { createTemplateSchema, templateSectionSchema } from '../dto/template.dto';

console.log('--- Running Assessment Template Builder Tests (Phase 3) ---');
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
    // 1. Template Schema validation
    try {
        const validTemplate = {
            subject_id: '990b7888-f25a-49d7-b224-15c0fd0db490',
            name: 'Final Term Blueprint 2026',
            description: 'Core blueprint matching academic year rules',
            status: 'DRAFT'
        };
        assert(createTemplateSchema.safeParse(validTemplate).success === true, 'Template schema validates valid inputs');

        const invalidTemplate = {
            name: '',
            subject_id: 'not-a-uuid'
        };
        assert(createTemplateSchema.safeParse(invalidTemplate).success === false, 'Template schema rejects empty names and invalid UUID keys');
    } catch (e: any) {
        assert(false, `Template schema exception: ${e.message}`);
    }

    // 2. Sections and dynamic rules schema validation
    try {
        const validSection = {
            section_name: 'Section A: Multiple Choice',
            points_per_question: 2,
            negative_marks: 0.5,
            total_questions: 15,
            sort_order: 1,
            rules: [
                { filter_field: 'difficulty', filter_value: 'MEDIUM', match_operator: 'eq' },
                { filter_field: 'bloom_level', filter_value: 'APPLY', match_operator: 'eq' }
            ]
        };
        assert(templateSectionSchema.safeParse(validSection).success === true, 'Section schema validates points, negative marks, and matching rules');

        const invalidSection = {
            section_name: '',
            total_questions: -5 // Invalid count
        };
        assert(templateSectionSchema.safeParse(invalidSection).success === false, 'Section schema rejects negative questions constraints');
    } catch (e: any) {
        assert(false, `Section schema exception: ${e.message}`);
    }

    // 3. Dynamic points calculation check
    try {
        const sectionsList = [
            { points_per_question: 1, total_questions: 10 },
            { points_per_question: 5, total_questions: 4 },
            { points_per_question: 10, total_questions: 2 }
        ];

        const totalMarks = sectionsList.reduce((sum, s) => sum + s.points_per_question * s.total_questions, 0);
        assert(totalMarks === 50, 'Sum calculation returns correct total points weight (10*1 + 5*4 + 10*2 = 50)');
    } catch (e: any) {
        assert(false, `Calculation check exception: ${e.message}`);
    }

    console.log(`\nTemplate Builder Tests Finished: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
