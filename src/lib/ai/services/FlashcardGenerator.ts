import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  IFlashcardGenerator, 
  FlashcardGenerationRequest, 
  FlashcardGenerationResult,
  GeneratedFlashcard,
  AIModel,
  AIError,
  AIValidationError,
  AITimeoutError,
  AIContentFilterError
} from '../types';

export class FlashcardGenerator implements IFlashcardGenerator {
  private genAI: GoogleGenerativeAI;
  private model: AIModel;

  constructor(model: AIModel = 'flash') {
    this.model = model;
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateFlashcards(request: FlashcardGenerationRequest): Promise<FlashcardGenerationResult> {
    const startTime = Date.now();
    
    try {
      // Validar requisição
      if (!this.validateRequest(request)) {
        throw new AIValidationError('Requisição inválida para geração de flashcards');
      }

      // Gerar prompt baseado na requisição
      const prompt = this.buildPrompt(request);
      
      // Chamar API do Gemini (usar modelos '-latest' compatíveis com v1beta)
      const model = this.genAI.getGenerativeModel({ 
        model: this.model === 'flash' ? 'gemini-2.5-flash' : 'gemini-2.5-flash' 
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parsear resposta e criar flashcards
      const flashcards = this.parseFlashcards(text, request);

      const processingTime = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(prompt + text);

      return {
        success: true,
        data: flashcards,
        metadata: {
          processingTime,
          model: this.model,
          tokensUsed,
          cost: this.calculateCost(tokensUsed),
          timestamp: new Date()
        }
      };

    } catch (error) {
      // Ainda que ocorra erro, não precisamos da variável
      
      if (error instanceof AIError) {
        throw error;
      }

      // Tratar erros específicos do Gemini
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new AITimeoutError('Timeout na geração de flashcards');
        }
        if (error.message.includes('content filter')) {
          throw new AIContentFilterError('Conteúdo filtrado pela API');
        }
      }

      throw new AIError(
        `Erro na geração de flashcards: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'GENERATION_ERROR',
        500
      );
    }
  }

  validateRequest(request: FlashcardGenerationRequest): boolean {
    if (!request.topic || request.topic.trim().length === 0) {
      return false;
    }
    
    if (request.count < 1 || request.count > 10) {
      return false;
    }
    
    if (!['beginner', 'intermediate', 'advanced'].includes(request.difficulty)) {
      return false;
    }
    
    return true;
  }

  estimateCost(request: FlashcardGenerationRequest): number {
    // Estimativa baseada no número de flashcards e complexidade
    const baseCost = 0.001; // $0.001 por flashcard
    const difficultyMultiplier = {
      beginner: 1,
      intermediate: 1.2,
      advanced: 1.5
    };
    
    return request.count * baseCost * difficultyMultiplier[request.difficulty];
  }

  private buildPrompt(request: FlashcardGenerationRequest): string {
    const { topic, difficulty, count, userContext, preferences } = request;
    
    let prompt = `Gere ${count} flashcards sobre "${topic}" com nível de dificuldade ${difficulty}.\n\n`;
    
    prompt += `Instruções:\n`;
    prompt += `- Perguntas devem ser claras e diretas\n`;
    prompt += `- Respostas devem ser concisas mas completas\n`;
    prompt += `- Use linguagem técnica apropriada para o nível ${difficulty}\n`;
    
    if (preferences?.includeExamples) {
      prompt += `- Inclua exemplos práticos quando relevante\n`;
    }
    
    if (preferences?.focusOnPractical) {
      prompt += `- Foque em aplicações práticas\n`;
    }
    
    if (preferences?.preferShortAnswers) {
      prompt += `- Mantenha respostas curtas (máximo 2-3 frases)\n`;
    }
    
    if (userContext) {
      prompt += `\nContexto do usuário: ${userContext}\n`;
    }
    
    prompt += `\nFormato de resposta (JSON):\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "question": "Pergunta aqui",\n`;
    prompt += `    "answer": "Resposta aqui",\n`;
    prompt += `    "tags": ["tag1", "tag2"],\n`;
    prompt += `    "explanation": "Explicação opcional",\n`;
    prompt += `    "estimatedTime": 30\n`;
    prompt += `  }\n`;
    prompt += `]\n\n`;
    
    prompt += `Gere apenas o JSON, sem texto adicional.`;
    
    return prompt;
  }

  private parseFlashcards(text: string, request: FlashcardGenerationRequest): GeneratedFlashcard[] {
    try {
      // Limpar texto e extrair JSON
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const flashcardsData = JSON.parse(cleanedText);
      
      if (!Array.isArray(flashcardsData)) {
        throw new Error('Resposta não é um array');
      }
      
      return flashcardsData.map((item: Record<string, unknown>, index: number) => ({
        question: (item.question as string) || `Pergunta ${index + 1}`,
        answer: (item.answer as string) || `Resposta ${index + 1}`,
        difficulty: request.difficulty,
        tags: (item.tags as string[]) || [request.topic],
        explanation: item.explanation as string | undefined,
        estimatedTime: (item.estimatedTime as number) || 30,
        source: 'ai_generated' as const,
        category: this.determineCategory(request.topic),
        relatedConcepts: (item.tags as string[]) || [request.topic]
      }));
      
    } catch (error) {
      throw new AIError(
        `Erro ao processar resposta da IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'PARSE_ERROR',
        500
      );
    }
  }

  private determineCategory(topic: string): 'technical' | 'theoretical' | 'practical' | 'general' {
    const technicalKeywords = ['api', 'database', 'server', 'client', 'framework', 'library', 'algorithm'];
    const theoreticalKeywords = ['concept', 'theory', 'principle', 'model', 'paradigm'];
    const practicalKeywords = ['implementation', 'practice', 'example', 'use case', 'application'];
    
    const lowerTopic = topic.toLowerCase();
    
    if (technicalKeywords.some(keyword => lowerTopic.includes(keyword))) {
      return 'technical';
    }
    if (theoreticalKeywords.some(keyword => lowerTopic.includes(keyword))) {
      return 'theoretical';
    }
    if (practicalKeywords.some(keyword => lowerTopic.includes(keyword))) {
      return 'practical';
    }
    
    return 'general';
  }

  private estimateTokens(text: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }

  private calculateCost(tokens: number): number {
    // Preços aproximados do Gemini (por 1M tokens)
    const pricePerMillionTokens = this.model === 'flash' ? 0.075 : 1.25;
    return (tokens / 1000000) * pricePerMillionTokens;
  }
}
