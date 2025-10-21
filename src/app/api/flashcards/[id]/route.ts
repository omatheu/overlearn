import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const flashcard = await prisma.flashcard.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            concepts: {
              include: {
                concept: true
              }
            }
          }
        },
        concept: true,
        reviews: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!flashcard) {
      return NextResponse.json(
        { error: 'Flashcard não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Erro ao buscar flashcard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { question, answer, taskId, conceptId, source } = body;
    
    // Verificar se o flashcard existe
    const existingFlashcard = await prisma.flashcard.findUnique({
      where: { id }
    });
    
    if (!existingFlashcard) {
      return NextResponse.json(
        { error: 'Flashcard não encontrado' },
        { status: 404 }
      );
    }
    
    // Atualizar flashcard
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id },
      data: {
        question: question || existingFlashcard.question,
        answer: answer || existingFlashcard.answer,
        taskId: taskId !== undefined ? taskId : existingFlashcard.taskId,
        conceptId: conceptId !== undefined ? conceptId : existingFlashcard.conceptId,
        source: source || existingFlashcard.source,
        updatedAt: new Date()
      },
      include: {
        task: {
          include: {
            concepts: {
              include: {
                concept: true
              }
            }
          }
        },
        concept: true
      }
    });
    
    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    console.error('Erro ao atualizar flashcard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar se o flashcard existe
    const existingFlashcard = await prisma.flashcard.findUnique({
      where: { id }
    });
    
    if (!existingFlashcard) {
      return NextResponse.json(
        { error: 'Flashcard não encontrado' },
        { status: 404 }
      );
    }
    
    // Deletar flashcard (reviews serão deletadas automaticamente por cascade)
    await prisma.flashcard.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      message: 'Flashcard deletado com sucesso',
      id 
    });
  } catch (error) {
    console.error('Erro ao deletar flashcard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
