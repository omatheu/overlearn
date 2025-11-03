import { NextResponse } from 'next/server';
import { FlashcardGenerator } from '@/lib/ai/services/FlashcardGenerator';
import {
  FlashcardGenerationRequest,
  AIError,
  AIValidationError,
  AITimeoutError,
  AIContentFilterError,
  AIConfigurationError
} from '@/lib/ai/types';

export async function POST(request: Request) {
  try {
    const body: FlashcardGenerationRequest = await request.json();
    
    // Validar se a API key está configurada
    if (!process.env.GEMINI_API_KEY) {
      throw new AIConfigurationError('GEMINI_API_KEY não configurada');
    }

    // Criar instância do gerador
    const generator = new FlashcardGenerator('flash');
    
    // Gerar flashcards
    const result = await generator.generateFlashcards(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      flashcards: result.data,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Erro na API de geração de flashcards:', error);
    
    if (error instanceof AIValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error instanceof AITimeoutError) {
      return NextResponse.json(
        { error: 'Timeout na geração de flashcards. Tente novamente.' },
        { status: 408 }
      );
    }
    
    if (error instanceof AIContentFilterError) {
      return NextResponse.json(
        { error: 'Conteúdo filtrado pela API. Tente reformular a solicitação.' },
        { status: 400 }
      );
    }
    
    if (error instanceof AIConfigurationError) {
      return NextResponse.json(
        { error: 'Configuração de IA não disponível' },
        { status: 503 }
      );
    }
    
    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para estimar custo antes da geração
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced';
    const count = parseInt(searchParams.get('count') || '1');
    
    if (!topic || !difficulty || !count) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: topic, difficulty, count' },
        { status: 400 }
      );
    }
    
    const generator = new FlashcardGenerator('flash');
    const generationRequest: FlashcardGenerationRequest = {
      topic,
      difficulty,
      count
    };
    
    const estimatedCost = generator.estimateCost(generationRequest);
    
    return NextResponse.json({
      estimatedCost,
      currency: 'USD',
      model: 'flash'
    });
    
  } catch (error) {
    console.error('Erro na estimativa de custo:', error);
    return NextResponse.json(
      { error: 'Erro ao estimar custo' },
      { status: 500 }
    );
  }
}
