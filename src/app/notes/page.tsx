"use client";

import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { useNotes, useUpdateNote, useDeleteNote, type Note } from "@/lib/hooks/useNotes";
import { useTags, useCreateTag } from "@/lib/hooks/useTags";
import { useTasks } from "@/lib/hooks/useTasks";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Search, Filter, Calendar, Tag as TagIcon, CheckSquare, Pencil, Trash2, X, Plus } from "lucide-react";

export default function NotesPage() {
  const { data: notes, isLoading } = useNotes();
  const { data: tags } = useTags();
  const { data: tasks } = useTasks();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const createTag = useCreateTag();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<Note | null>(null);

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    taskId: null as string | null,
    tagIds: [] as string[],
  });
  const [newTagName, setNewTagName] = useState("");

  const filteredNotes = notes?.filter(note => {
    const matchesSearch = searchQuery === "" ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !filterTagId ||
      note.tags.some(({ tag }) => tag.id === filterTagId);

    return matchesSearch && matchesTag;
  }) || [];

  const activeTasks = tasks?.filter(task => task.status !== 'done') || [];

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditForm({
      title: note.title || "",
      content: note.content,
      taskId: note.taskId,
      tagIds: note.tags.map(({ tag }) => tag.id),
    });
  };

  const handleAddTag = (tagId: string) => {
    if (!editForm.tagIds.includes(tagId)) {
      setEditForm({ ...editForm, tagIds: [...editForm.tagIds, tagId] });
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setEditForm({ ...editForm, tagIds: editForm.tagIds.filter(id => id !== tagId) });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag.mutateAsync({
        name: newTagName.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      });
      setEditForm({ ...editForm, tagIds: [...editForm.tagIds, newTag.id] });
      setNewTagName("");
    } catch (error) {
      console.error("Erro ao criar tag:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editForm.content.trim()) return;

    try {
      await updateNote.mutateAsync({
        id: editingNote.id,
        title: editForm.title.trim() || undefined,
        content: editForm.content.trim(),
        taskId: editForm.taskId || undefined,
        tagIds: editForm.tagIds.length > 0 ? editForm.tagIds : undefined,
      });
      setEditingNote(null);
      setEditForm({ title: "", content: "", taskId: null, tagIds: [] });
    } catch (error) {
      console.error("Erro ao atualizar nota:", error);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteDialog) return;

    try {
      await deleteNote.mutateAsync(showDeleteDialog.id);
      setShowDeleteDialog(null);
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 48) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader
          title="Notas"
          description="Carregando suas notas..."
        />
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Notas"
        description={`${notes?.length || 0} nota${notes?.length !== 1 ? 's' : ''} salva${notes?.length !== 1 ? 's' : ''}`}
        icon={StickyNote}
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterTagId || "all"}
                onValueChange={(value) => setFilterTagId(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as tags</SelectItem>
                  {tags?.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#888' }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filterTagId && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtrando por:</span>
                <Badge variant="secondary">
                  {tags?.find(t => t.id === filterTagId)?.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterTagId(null)}
                >
                  Limpar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || filterTagId ? "Nenhuma nota encontrada" : "Nenhuma nota ainda"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterTagId
                    ? "Tente ajustar os filtros de busca"
                    : "Comece criando uma nota na página de Overview"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {note.title && (
                          <h3 className="text-lg font-semibold">{note.title}</h3>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteDialog(note)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 p-3 rounded-md">
                      {note.content}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t">
                      <div className="flex gap-2 flex-wrap">
                        {note.tags.map(({ tag }) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="cursor-pointer"
                            style={{
                              backgroundColor: tag.color || undefined,
                              color: tag.color ? '#fff' : undefined
                            }}
                            onClick={() => setFilterTagId(tag.id)}
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))}
                        {note.task && (
                          <Badge variant="outline">
                            <CheckSquare className="h-3 w-3 mr-1" />
                            {note.task.title}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Nota</DialogTitle>
            <DialogDescription>
              Atualize o conteúdo, título, tags ou tarefa vinculada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título (opcional)</Label>
              <Input
                id="edit-title"
                placeholder="Título da nota..."
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Conteúdo</Label>
              <Textarea
                id="edit-content"
                placeholder="Digite sua nota aqui..."
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task">Vincular a uma tarefa (opcional)</Label>
              <Select
                value={editForm.taskId || "none"}
                onValueChange={(value) => setEditForm({ ...editForm, taskId: value === "none" ? null : value })}
              >
                <SelectTrigger id="edit-task">
                  <SelectValue placeholder="Nenhuma tarefa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma tarefa</SelectItem>
                  {activeTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editForm.tagIds.map((tagId) => {
                  const tag = tags?.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className="cursor-pointer"
                      style={{ backgroundColor: tag.color || undefined }}
                    >
                      {tag.name}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => handleRemoveTag(tagId)}
                      />
                    </Badge>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Select onValueChange={handleAddTag}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar tag existente" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags?.filter(tag => !editForm.tagIds.includes(tag.id)).map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color || '#888' }}
                          />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateTag();
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || createTag.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editForm.content.trim() || updateNote.isPending}>
              {updateNote.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Nota</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar esta nota? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {showDeleteDialog && (
            <div className="py-4">
              {showDeleteDialog.title && (
                <h4 className="font-medium mb-2">{showDeleteDialog.title}</h4>
              )}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {showDeleteDialog.content}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteNote.isPending}>
              {deleteNote.isPending ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
