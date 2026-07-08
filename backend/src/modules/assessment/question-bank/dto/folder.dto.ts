import { z } from 'zod';

export const createFolderSchema = z.object({
    name: z.string().min(1, 'Folder name is required'),
    parent_id: z.string().uuid().optional().nullable()
});

export const updateFolderSchema = z.object({
    name: z.string().min(1, 'Folder name is required').optional(),
    parent_id: z.string().uuid().optional().nullable()
});

export type CreateFolderDto = z.infer<typeof createFolderSchema>;
export type UpdateFolderDto = z.infer<typeof updateFolderSchema>;
