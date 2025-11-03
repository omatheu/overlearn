import { NextResponse } from 'next/server';
import { flashModel } from '@/lib/ai/gemini';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Pergunta e resposta são obrigatórias' },
        { status: 400 }
      );
    }

    const prompt = `Analise o seguinte flashcard e extraia conceitos técnicos relevantes:

Pergunta: ${question}
Resposta: ${answer}

Retorne uma lista de 2-5 conceitos técnicos principais (não mais que 5) que são abordados neste flashcard.
Para cada conceito, forneça:
- name: nome do conceito (curto, técnico, em português)
- description: breve descrição do conceito (1-2 frases)
- category: categoria técnica (ex: "frontend", "backend", "devops", "database", "language", "framework", "pattern", "algorithm")

Retorne APENAS um JSON válido no formato:
{
  "concepts": [
    { "name": "...", "description": "...", "category": "..." }
  ]
}

Regras importantes:
- Use nomes técnicos precisos
- Descrições devem ser claras e objetivas
- Evite conceitos muito genéricos
- Máximo de 5 conceitos
- Retorne apenas o JSON, sem texto adicional`;

    const result = await flashModel.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text, parseError);
      return NextResponse.json(
        { error: 'Falha ao processar resposta da IA' },
        { status: 500 }
      );
    }

    const { concepts } = parsedResponse;

    if (!Array.isArray(concepts)) {
      return NextResponse.json(
        { error: 'Resposta da IA inválida' },
        { status: 500 }
      );
    }

    // Check which concepts already exist
    const existingConcepts = await prisma.concept.findMany({
      where: {
        name: {
          in: concepts.map((c: { name: string }) => c.name)
        }
      }
    });

    const existingNames = new Set(existingConcepts.map(c => c.name));

    const enrichedConcepts = concepts.map((concept: { name: string; description: string; category: string }) => ({
      ...concept,
      exists: existingNames.has(concept.name),
      existingConcept: existingConcepts.find(c => c.name === concept.name)
    }));

    return NextResponse.json({
      concepts: enrichedConcepts
    });

  } catch (error) {
    console.error('Erro ao gerar conceitos:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar conceitos com IA' },
      { status: 500 }
    );
  }
}
