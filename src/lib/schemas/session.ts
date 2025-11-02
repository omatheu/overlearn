/**
 * Study Session Validation Schemas
 *
 * Zod schemas for validating session-related API requests
 */

import { z } from 'zod';
import { SESSION_TYPE, FOCUS_SCORE } from '../constants/app';

/**
 * Schema for creating a new study session
 */
export const createSessionSchema = z.object({
  type: z
    .enum([SESSION_TYPE.STUDY, SESSION_TYPE.WORK, SESSION_TYPE.REVIEW, SESSION_TYPE.BREAK])
    .default(SESSION_TYPE.STUDY),

  duration: z
    .number()
    .int('Duração deve ser um número inteiro')
    .positive('Duração deve ser positiva')
    .max(1440, 'Duração não pode exceder 1440 minutos (24 horas)'),

  taskId: z
    .string()
    .cuid('ID de tarefa inválido')
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, 'Notas muito longas (máximo 1000 caracteres)')
    .optional()
    .nullable(),

  focusScore: z
    .number()
    .int('Pontuação de foco deve ser um número inteiro')
    .min(FOCUS_SCORE.MIN, `Pontuação mínima é ${FOCUS_SCORE.MIN}`)
    .max(FOCUS_SCORE.MAX, `Pontuação máxima é ${FOCUS_SCORE.MAX}`)
    .optional()
    .nullable(),
});

/**
 * Schema for updating an existing session
 */
export const updateSessionSchema = z.object({
  type: z
    .enum([SESSION_TYPE.STUDY, SESSION_TYPE.WORK, SESSION_TYPE.REVIEW, SESSION_TYPE.BREAK])
    .optional(),

  duration: z
    .number()
    .int('Duração deve ser um número inteiro')
    .positive('Duração deve ser positiva')
    .max(1440, 'Duração não pode exceder 1440 minutos (24 horas)')
    .optional(),

  taskId: z
    .string()
    .cuid('ID de tarefa inválido')
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, 'Notas muito longas (máximo 1000 caracteres)')
    .optional()
    .nullable(),

  focusScore: z
    .number()
    .int('Pontuação de foco deve ser um número inteiro')
    .min(FOCUS_SCORE.MIN, `Pontuação mínima é ${FOCUS_SCORE.MIN}`)
    .max(FOCUS_SCORE.MAX, `Pontuação máxima é ${FOCUS_SCORE.MAX}`)
    .optional()
    .nullable(),
});

/**
 * Schema for session ID parameter
 */
export const sessionIdSchema = z.object({
  id: z.string().cuid('ID de sessão inválido'),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionIdParam = z.infer<typeof sessionIdSchema>;
