/**
 * Concept Validation Schemas
 *
 * Zod schemas for validating concept-related API requests
 */

import { z } from 'zod';
import { VALIDATION } from '../constants/app';

/**
 * Schema for creating a new concept
 */
export const createConceptSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(VALIDATION.MAX_CONCEPT_NAME_LENGTH, `Nome muito longo (máximo ${VALIDATION.MAX_CONCEPT_NAME_LENGTH} caracteres)`),

  description: z
    .string()
    .max(VALIDATION.MAX_CONCEPT_DESCRIPTION_LENGTH, `Descrição muito longa (máximo ${VALIDATION.MAX_CONCEPT_DESCRIPTION_LENGTH} caracteres)`)
    .optional()
    .nullable(),

  category: z
    .string()
    .max(100, 'Categoria muito longa (máximo 100 caracteres)')
    .optional()
    .nullable(),

  studyGoalId: z
    .string()
    .cuid('ID de meta de estudo inválido')
    .optional()
    .nullable(),
});

/**
 * Schema for updating an existing concept
 */
export const updateConceptSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome não pode estar vazio')
    .max(VALIDATION.MAX_CONCEPT_NAME_LENGTH, `Nome muito longo (máximo ${VALIDATION.MAX_CONCEPT_NAME_LENGTH} caracteres)`)
    .optional(),

  description: z
    .string()
    .max(VALIDATION.MAX_CONCEPT_DESCRIPTION_LENGTH, `Descrição muito longa (máximo ${VALIDATION.MAX_CONCEPT_DESCRIPTION_LENGTH} caracteres)`)
    .optional()
    .nullable(),

  category: z
    .string()
    .max(100, 'Categoria muito longa (máximo 100 caracteres)')
    .optional()
    .nullable(),

  studyGoalId: z
    .string()
    .cuid('ID de meta de estudo inválido')
    .optional()
    .nullable(),
});

/**
 * Schema for generating concepts via AI
 */
export const generateConceptsSchema = z.object({
  question: z
    .string()
    .min(1, 'Pergunta é obrigatória')
    .max(500, 'Pergunta muito longa'),

  answer: z
    .string()
    .min(1, 'Resposta é obrigatória')
    .max(1000, 'Resposta muito longa'),
});

/**
 * Schema for concept ID parameter
 */
export const conceptIdSchema = z.object({
  id: z.string().cuid('ID de conceito inválido'),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateConceptInput = z.infer<typeof createConceptSchema>;
export type UpdateConceptInput = z.infer<typeof updateConceptSchema>;
export type GenerateConceptsInput = z.infer<typeof generateConceptsSchema>;
export type ConceptIdParam = z.infer<typeof conceptIdSchema>;
