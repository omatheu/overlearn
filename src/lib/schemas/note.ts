/**
 * Note Validation Schemas
 *
 * Zod schemas for validating note-related API requests
 */

import { z } from 'zod';
import { VALIDATION } from '../constants/app';

/**
 * Schema for creating a new note
 */
export const createNoteSchema = z.object({
  title: z
    .string()
    .max(200, 'Título muito longo (máximo 200 caracteres)')
    .optional()
    .nullable(),

  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .max(VALIDATION.MAX_NOTE_CONTENT_LENGTH, `Conteúdo muito longo (máximo ${VALIDATION.MAX_NOTE_CONTENT_LENGTH} caracteres)`),

  taskId: z
    .string()
    .cuid('ID de tarefa inválido')
    .optional()
    .nullable(),

  tagIds: z
    .array(z.string().cuid('ID de tag inválido'))
    .optional()
    .default([]),
});

/**
 * Schema for updating an existing note
 */
export const updateNoteSchema = z.object({
  title: z
    .string()
    .max(200, 'Título muito longo (máximo 200 caracteres)')
    .optional()
    .nullable(),

  content: z
    .string()
    .min(1, 'Conteúdo não pode estar vazio')
    .max(VALIDATION.MAX_NOTE_CONTENT_LENGTH, `Conteúdo muito longo (máximo ${VALIDATION.MAX_NOTE_CONTENT_LENGTH} caracteres)`)
    .optional(),

  taskId: z
    .string()
    .cuid('ID de tarefa inválido')
    .optional()
    .nullable(),

  tagIds: z
    .array(z.string().cuid('ID de tag inválido'))
    .optional(),
});

/**
 * Schema for creating a new tag
 */
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(VALIDATION.MAX_TAG_NAME_LENGTH, `Nome muito longo (máximo ${VALIDATION.MAX_TAG_NAME_LENGTH} caracteres)`)
    .regex(/^[a-zA-Z0-9-_]+$/, 'Tag deve conter apenas letras, números, hífens e underscores'),

  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um código hexadecimal válido (#RRGGBB)')
    .optional()
    .nullable(),
});

/**
 * Schema for note ID parameter
 */
export const noteIdSchema = z.object({
  id: z.string().cuid('ID de nota inválido'),
});

/**
 * Schema for tag ID parameter
 */
export const tagIdSchema = z.object({
  id: z.string().cuid('ID de tag inválido'),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type NoteIdParam = z.infer<typeof noteIdSchema>;
export type TagIdParam = z.infer<typeof tagIdSchema>;
