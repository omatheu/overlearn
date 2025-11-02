/**
 * Flashcard Validation Schemas
 *
 * Zod schemas for validating flashcard-related API requests
 */

import { z } from 'zod';
import { VALIDATION } from '../constants/app';
import { SM2_QUALITY } from '../constants/sm2';

/**
 * Schema for creating a new flashcard
 */
export const createFlashcardSchema = z.object({
  question: z
    .string()
    .min(1, 'Pergunta é obrigatória')
    .max(VALIDATION.MAX_FLASHCARD_QUESTION_LENGTH, `Pergunta muito longa (máximo ${VALIDATION.MAX_FLASHCARD_QUESTION_LENGTH} caracteres)`),

  answer: z
    .string()
    .min(1, 'Resposta é obrigatória')
    .max(VALIDATION.MAX_FLASHCARD_ANSWER_LENGTH, `Resposta muito longa (máximo ${VALIDATION.MAX_FLASHCARD_ANSWER_LENGTH} caracteres)`),

  taskId: z
    .string()
    .cuid('ID de tarefa inválido')
    .optional()
    .nullable(),

  conceptId: z
    .string()
    .cuid('ID de conceito inválido')
    .optional()
    .nullable(),

  source: z
    .enum(['manual', 'ai_generated'])
    .default('manual'),
});

/**
 * Schema for updating an existing flashcard
 */
export const updateFlashcardSchema = z.object({
  question: z
    .string()
    .min(1, 'Pergunta não pode estar vazia')
    .max(VALIDATION.MAX_FLASHCARD_QUESTION_LENGTH, `Pergunta muito longa (máximo ${VALIDATION.MAX_FLASHCARD_QUESTION_LENGTH} caracteres)`)
    .optional(),

  answer: z
    .string()
    .min(1, 'Resposta não pode estar vazia')
    .max(VALIDATION.MAX_FLASHCARD_ANSWER_LENGTH, `Resposta muito longa (máximo ${VALIDATION.MAX_FLASHCARD_ANSWER_LENGTH} caracteres)`)
    .optional(),

  taskId: z
    .string()
    .cuid('ID de tarefa inválido')
    .optional()
    .nullable(),

  conceptId: z
    .string()
    .cuid('ID de conceito inválido')
    .optional()
    .nullable(),
});

/**
 * Schema for reviewing a flashcard
 */
export const reviewFlashcardSchema = z.object({
  quality: z
    .number()
    .int('Qualidade deve ser um número inteiro')
    .min(SM2_QUALITY.BLACKOUT, `Qualidade mínima é ${SM2_QUALITY.BLACKOUT}`)
    .max(SM2_QUALITY.PERFECT, `Qualidade máxima é ${SM2_QUALITY.PERFECT}`),

  timeSpent: z
    .number()
    .int('Tempo gasto deve ser um número inteiro')
    .positive('Tempo gasto deve ser positivo')
    .optional()
    .nullable(),
});

/**
 * Schema for flashcard ID parameter
 */
export const flashcardIdSchema = z.object({
  id: z.string().cuid('ID de flashcard inválido'),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;
export type FlashcardIdParam = z.infer<typeof flashcardIdSchema>;
