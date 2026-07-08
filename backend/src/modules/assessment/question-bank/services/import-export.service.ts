import { BaseService } from '../../../admission/services/BaseService';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from '../dto/question.dto';

export class ImportExportService extends BaseService {
    private readonly questionService: QuestionService;

    constructor() {
        super();
        this.questionService = new QuestionService();
    }

    /**
     * Parses a CSV file buffer, validates schemas, runs duplicate warning checks, and writes in bulk.
     * CSV Schema fields: question_text, question_type, points, difficulty, bloom_level, options_text (A|B|C), correct_options (0,2)
     */
    public async importQuestionsFromCsv(
        schoolId: string,
        userId: string,
        academicYearId: string,
        subjectId: string,
        folderId: string | null,
        csvContent: string,
        correlationId?: string
    ): Promise<{ successCount: number; errors: { row: number; error: string }[] }> {
        this.logInfo(`Parsing CSV bulk questions upload for subject: ${subjectId}`, correlationId);
        const lines = csvContent.split(/\r?\n/);
        const results = {
            successCount: 0,
            errors: [] as { row: number; error: string }[]
        };

        if (lines.length <= 1) {
            results.errors.push({ row: 0, error: 'CSV file is empty or missing data rows.' });
            return results;
        }

        // CSV Header map check
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const getIdx = (name: string) => headers.indexOf(name);

        const textIdx = getIdx('question_text');
        const typeIdx = getIdx('question_type');
        const pointsIdx = getIdx('points');
        const diffIdx = getIdx('difficulty');
        const bloomIdx = getIdx('bloom_level');
        const optionsIdx = getIdx('options_text');
        const correctIdx = getIdx('correct_options');

        if (textIdx === -1 || typeIdx === -1 || optionsIdx === -1) {
            results.errors.push({ row: 0, error: 'Required headers (question_text, question_type, options_text) are missing.' });
            return results;
        }

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty rows

            try {
                // Parsing basic columns (handling double-quoted values containing commas)
                const columns = this.parseCsvLine(line);

                const questionText = columns[textIdx]?.trim();
                const questionType = (columns[typeIdx]?.trim() || 'MCQ') as any;
                const points = columns[pointsIdx] ? parseFloat(columns[pointsIdx]) : 1.00;
                const difficulty = (columns[diffIdx]?.trim() || 'MEDIUM') as any;
                const bloomLevel = (columns[bloomIdx]?.trim() || 'UNDERSTAND') as any;
                const optionsRaw = columns[optionsIdx]?.trim() || '';
                const correctRaw = columns[correctIdx]?.trim() || '0';

                if (!questionText) {
                    results.errors.push({ row: i + 1, error: 'Question text is empty.' });
                    continue;
                }

                // Split options by Pipe
                const optionItems = optionsRaw.split('|').map(o => o.trim()).filter(Boolean);
                if (optionItems.length === 0 && questionType !== 'SUBJECTIVE') {
                    results.errors.push({ row: i + 1, error: 'No choices defined for selection question type.' });
                    continue;
                }

                // Correct option Indices
                const correctIndices = correctRaw.split(';').map(idx => parseInt(idx.trim(), 10));

                const optionsPayload = optionItems.map((opt, optIdx) => ({
                    option_text: opt,
                    is_correct: correctIndices.includes(optIdx)
                }));

                const payload: CreateQuestionDto = {
                    academic_year_id: academicYearId,
                    subject_id: subjectId,
                    folder_id: folderId,
                    question_text: questionText,
                    question_type: questionType,
                    points,
                    negative_marks: 0,
                    difficulty,
                    bloom_level: bloomLevel,
                    options: optionsPayload,
                    taxonomy_tags: [],
                    status: 'DRAFT'
                };

                await this.questionService.createQuestion(schoolId, userId, payload, correlationId);
                results.successCount++;
            } catch (error: any) {
                results.errors.push({
                    row: i + 1,
                    error: error.message || 'Validation or insertion error occurred.'
                });
            }
        }

        return results;
    }

    /**
     * Standalone CSV row splitter, honoring double quote blocks containing commas.
     */
    private parseCsvLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }
}
