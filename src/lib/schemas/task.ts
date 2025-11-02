/**
 * Task Validation Schemas
 *
 * Zod schemas for validating task-related API requests
 */

import { z } from 'zod';
import { VALIDATION, TASK_PRIORITY, TASK_STATUS } from '../constants/app';

/**
 * Schema for creating a new task
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(VALIDATION.MAX_TASK_TITLE_LENGTH, `Título muito longo (máximo ${VALIDATION.MAX_TASK_TITLE_LENGTH} caracteres)`),

  description: z
    .string()
    .max(1000, 'Descrição muito longa (máximo 1000 caracteres)')
    .optional()
    .nullable(),

  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DONE, TASK_STATUS.CANCELLED])
    .default(TASK_STATUS.TODO),

  priority: z
    .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH, TASK_PRIORITY.URGENT])
    .default(TASK_PRIORITY.MEDIUM),

  dueDate: z
    .string()
    .datetime({ message: 'Data de vencimento inválida' })
    .optional()
    .nullable()
    .or(z.literal('')),

  scheduledDate: z
    .string()
    .datetime({ message: 'Data agendada inválida' })
    .optional()
    .nullable()
    .or(z.literal('')),

  estimatedTime: z
    .number()
    .int('Tempo estimado deve ser um número inteiro')
    .positive('Tempo estimado deve ser positivo')
    .max(1440, 'Tempo estimado não pode exceder 1440 minutos (24 horas)')
    .optional()
    .nullable(),

  studyGoalId: z
    .string()
    .cuid('ID de meta de estudo inválido')
    .optional()
    .nullable(),

  conceptIds: z
    .array(z.string().cuid('ID de conceito inválido'))
    .optional()
    .default([]),
});

/**
 * Schema for updating an existing task
 * All fields are optional since updates can be partial
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título não pode estar vazio')
    .max(VALIDATION.MAX_TASK_TITLE_LENGTH, `Título muito longo (máximo ${VALIDATION.MAX_TASK_TITLE_LENGTH} caracteres)`)
    .optional(),

  description: z
    .string()
    .max(1000, 'Descrição muito longa (máximo 1000 caracteres)')
    .optional()
    .nullable(),

  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DONE, TASK_STATUS.CANCELLED])
    .optional(),

  priority: z
    .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH, TASK_PRIORITY.URGENT])
    .optional(),

  dueDate: z
    .string()
    .datetime({ message: 'Data de vencimento inválida' })
    .optional()
    .nullable()
    .or(z.literal('')),

  scheduledDate: z
    .string()
    .datetime({ message: 'Data agendada inválida' })
    .optional()
    .nullable()
    .or(z.literal('')),

  estimatedTime: z
    .number()
    .int('Tempo estimado deve ser um número inteiro')
    .positive('Tempo estimado deve ser positivo')
    .max(1440, 'Tempo estimado não pode exceder 1440 minutos (24 horas)')
    .optional()
    .nullable(),

  studyGoalId: z
    .string()
    .cuid('ID de meta de estudo inválido')
    .optional()
    .nullable(),

  conceptIds: z
    .array(z.string().cuid('ID de conceito inválido'))
    .optional(),
});

/**
 * Schema for task ID parameter
 */
export const taskIdSchema = z.object({
  id: z.string().cuid('ID de tarefa inválido'),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskIdParam = z.infer<typeof taskIdSchema>;
