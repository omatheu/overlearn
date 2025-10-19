// Erros específicos do sistema de IA
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// Erros de configuração
export class AIConfigurationError extends AIError {
  constructor(message: string) {
    super(message, 'AI_CONFIGURATION_ERROR', 500);
    this.name = 'AIConfigurationError';
  }
}

// Erros de validação
export class AIValidationError extends AIError {
  constructor(message: string) {
    super(message, 'AI_VALIDATION_ERROR', 400);
    this.name = 'AIValidationError';
  }
}

// Erros de limite de uso
export class AIQuotaExceededError extends AIError {
  constructor(message: string) {
    super(message, 'AI_QUOTA_EXCEEDED', 429);
    this.name = 'AIQuotaExceededError';
  }
}

// Erros de timeout
export class AITimeoutError extends AIError {
  constructor(message: string) {
    super(message, 'AI_TIMEOUT_ERROR', 408);
    this.name = 'AITimeoutError';
  }
}

// Erros de modelo não disponível
export class AIModelUnavailableError extends AIError {
  constructor(message: string) {
    super(message, 'AI_MODEL_UNAVAILABLE', 503);
    this.name = 'AIModelUnavailableError';
  }
}

// Erros de conteúdo inadequado
export class AIContentFilterError extends AIError {
  constructor(message: string) {
    super(message, 'AI_CONTENT_FILTER_ERROR', 400);
    this.name = 'AIContentFilterError';
  }
}

// Função utilitária para tratar erros
export function handleAIError(error: unknown): AIError {
  if (error instanceof AIError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AIError(error.message, 'UNKNOWN_ERROR', 500);
  }
  
  return new AIError('Erro desconhecido', 'UNKNOWN_ERROR', 500);
}
