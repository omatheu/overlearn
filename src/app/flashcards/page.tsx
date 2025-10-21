'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar, 
  Target, 
  Brain,
  Edit,
  Trash2,
  Play
} from 'lucide-react';
import { useFlashcards, useDeleteFlashcard } from '@/lib/hooks/useFlashcards';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FlashcardsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'due'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'nextReview' | 'repetitions'>('nextReview');
  
  const { data: flashcards, isLoading, error } = useFlashcards(filter);
  const deleteFlashcard = useDeleteFlashcard();

  // Filtrar flashcards por termo de busca
  const filteredFlashcards = flashcards?.filter(flashcard =>
    flashcard.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flashcard.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flashcard.task?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flashcard.concept?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Ordenar flashcards
  const sortedFlashcards = [...filteredFlashcards].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'nextReview':
        if (!a.nextReview && !b.nextReview) return 0;
        if (!a.nextReview) return -1;
        if (!b.nextReview) return 1;
        return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
      case 'repetitions':
        return b.repetitions - a.repetitions;
      default:
        return 0;
    }
  });

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este flashcard?')) {
      try {
        await deleteFlashcard.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao deletar flashcard:', error);
      }
    }
  };

  const getStatusBadge = (flashcard: { nextReview?: string | Date | null; easeFactor: number; repetitions: number }) => {
    if (!flashcard.nextReview) {
      return <Badge variant="destructive">Nunca revisado</Badge>;
    }
    
    const nextReview = new Date(flashcard.nextReview);
    const now = new Date();
    
    if (nextReview <= now) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    
    const daysUntil = Math.ceil((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 1) {
      return <Badge variant="secondary">Revisar hoje</Badge>;
    } else if (daysUntil <= 3) {
      return <Badge variant="outline">Em {daysUntil} dias</Badge>;
    } else {
      return <Badge variant="outline">Em {daysUntil} dias</Badge>;
    }
  };

  const getEaseFactorColor = (easeFactor: number) => {
    if (easeFactor >= 2.5) return 'text-green-600';
    if (easeFactor >= 2.0) return 'text-blue-600';
    if (easeFactor >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 animate-spin" />
              <p className="text-muted-foreground">Carregando flashcards...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">Erro ao carregar flashcards</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Flashcards
          </h1>
          <p className="text-muted-foreground">
            Sistema de repetição espaçada para aprendizado eficiente
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/flashcards/review')} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Revisar Agora
          </Button>
          <Button onClick={() => router.push('/flashcards/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Flashcard
          </Button>
        </div>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por pergunta, resposta, task ou conceito..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: 'all' | 'due') => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="due">Vencidos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'created' | 'nextReview' | 'repetitions') => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextReview">Próxima Revisão</SelectItem>
                  <SelectItem value="created">Data de Criação</SelectItem>
                  <SelectItem value="repetitions">Repetições</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold">{flashcards?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Vencidos</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {flashcards?.filter(f => !f.nextReview || new Date(f.nextReview) <= new Date()).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bem conhecidos</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {flashcards?.filter(f => f.easeFactor >= 2.5 && f.repetitions >= 3).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Taxa média</span>
            </div>
            <div className="text-2xl font-bold">
              {flashcards?.length ? 
                Math.round((flashcards.reduce((acc, f) => acc + f.easeFactor, 0) / flashcards.length) * 100) / 100 
                : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de flashcards */}
      <div className="space-y-4">
        {sortedFlashcards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum flashcard encontrado' : 'Nenhum flashcard criado'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando seu primeiro flashcard para acelerar seu aprendizado'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/flashcards/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Flashcard
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          sortedFlashcards.map((flashcard) => (
            <Card key={flashcard.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Pergunta */}
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{flashcard.question}</h3>
                      <p className="text-muted-foreground">{flashcard.answer}</p>
                    </div>

                    {/* Metadados */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {flashcard.task && (
                        <div className="flex items-center gap-1">
                          <span>Task:</span>
                          <span className="font-medium">{flashcard.task.title}</span>
                        </div>
                      )}
                      {flashcard.concept && (
                        <div className="flex items-center gap-1">
                          <span>Conceito:</span>
                          <span className="font-medium">{flashcard.concept.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>Repetições:</span>
                        <span className="font-medium">{flashcard.repetitions}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Facilidade:</span>
                        <span className={`font-medium ${getEaseFactorColor(flashcard.easeFactor)}`}>
                          {flashcard.easeFactor.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Status e data */}
                    <div className="flex items-center gap-4">
                      {getStatusBadge(flashcard)}
                      <span className="text-sm text-muted-foreground">
                        Criado {formatDistanceToNow(new Date(flashcard.createdAt), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/flashcards/${flashcard.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(flashcard.id)}
                      disabled={deleteFlashcard.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}