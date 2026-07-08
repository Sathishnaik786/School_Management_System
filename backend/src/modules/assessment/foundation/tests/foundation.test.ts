import { updateAssessmentConfigSchema } from '../dto/config.dto';
import { createWorkflowSchema } from '../dto/workflow.dto';
import { cacheProvider } from '../services/config.service';

console.log('--- Running Assessment Foundation Tests (Phase 1) ---');
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

function runTests() {
    // 1. Config schemas validations
    try {
        const validConfig = {
            max_upload_size_mb: 20,
            autosave_interval_secs: 15,
            default_heartbeat_secs: 45,
            timezone: 'Asia/Kolkata',
            retention_telemetry_days: 90,
            retention_attempts_years: 7
        };
        assert(updateAssessmentConfigSchema.safeParse(validConfig).success === true, 'Config schema validates correct values');

        const invalidConfig = {
            max_upload_size_mb: 0, // Invalid: must be at least 1
            autosave_interval_secs: 70, // Invalid: max 60
            default_heartbeat_secs: 5 // Invalid: min 10
        };
        assert(updateAssessmentConfigSchema.safeParse(invalidConfig).success === false, 'Config schema catches range boundary errors');
    } catch (e: any) {
        assert(false, `Config schemas validation error: ${e.message}`);
    }

    // 2. Workflow schemas validations
    try {
        const validWorkflow = {
            name: 'Academic Dean Cycle',
            description: 'Midterm approval review routing',
            is_active: true,
            steps: [
                { step_name: 'Teacher Draft', role_required: 'TEACHER', sort_order: 1 },
                { step_name: 'Dean Approval', role_required: 'DEAN', sort_order: 2 }
            ],
            transitions: [
                { from_status: 'DRAFT', to_status: 'REVIEW', rule_condition: null }
            ]
        };
        assert(createWorkflowSchema.safeParse(validWorkflow).success === true, 'Workflow schema validates step mappings');

        const invalidWorkflow = {
            name: '', // Empty name invalid
            steps: [] // Empty steps invalid
        };
        assert(createWorkflowSchema.safeParse(invalidWorkflow).success === false, 'Workflow schema rejects empty items');
    } catch (e: any) {
        assert(false, `Workflow schemas validation error: ${e.message}`);
    }

    // 3. Cache Provider operations
    try {
        const key = 'test_school_10';
        const configData = { school_id: 'school-10', max_upload_size_mb: 25 };

        // Test insertion
        cacheProvider.set(key, configData, 1000); // 1s expiry
        assert(cacheProvider.get(key) !== null, 'Cache resolves active stored objects');

        // Test deletion / invalidation
        cacheProvider.delete(key);
        assert(cacheProvider.get(key) === null, 'Cache returns null for deleted keys');

        // Test expiry
        cacheProvider.set(key, configData, 10); // 10ms expiry
        setTimeout(() => {
            assert(cacheProvider.get(key) === null, 'Cache purges expired items automatically');
            
            console.log(`\nAssessment Foundation Tests Finished: ${passed} passed, ${failed} failed.`);
            if (failed > 0) {
                process.exit(1);
            }
        }, 30);
    } catch (e: any) {
        assert(false, `Cache operations validation error: ${e.message}`);
    }
}

runTests();
