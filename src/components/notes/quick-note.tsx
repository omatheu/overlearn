"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Plus, X, Tag as TagIcon } from "lucide-react";
import { useCreateNote, useNotes } from "@/lib/hooks/useNotes";
import { useTags, useCreateTag } from "@/lib/hooks/useTags";
import { useTasks } from "@/lib/hooks/useTasks";

export function QuickNote() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const createNote = useCreateNote();
  const createTag = useCreateTag();
  const { data: notes } = useNotes();
  const { data: tags } = useTags();
  const { data: tasks } = useTasks();

  const activeTasks = tasks?.filter(task => task.status !== 'done') || [];
  const recentNotes = notes?.slice(0, 3) || [];

  const handleAddTag = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag.mutateAsync({
        name: newTagName.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      });
      setSelectedTagIds([...selectedTagIds, newTag.id]);
      setNewTagName("");
    } catch (error) {
      console.error("Erro ao criar tag:", error);
    }
  };

  const handleSaveNote = async () => {
    if (!content.trim()) return;

    try {
      await createNote.mutateAsync({
        title: title.trim() || undefined,
        content: content.trim(),
        taskId: selectedTaskId || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
      });

      setContent("");
      setTitle("");
      setSelectedTaskId(null);
      setSelectedTagIds([]);
      setShowAdvanced(false);
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Nota Rápida
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {showAdvanced && (
            <div className="space-y-2">
              <Label htmlFor="note-title">Título (opcional)</Label>
              <Input
                id="note-title"
                placeholder="Título da nota..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note-content">Conteúdo</Label>
            <Textarea
              id="note-content"
              placeholder="Digite sua nota aqui... (Suporta código, ideias, anotações de estudo, etc.)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={showAdvanced ? 6 : 4}
              className="font-mono text-sm resize-none"
            />
          </div>

          {showAdvanced && (
            <>
              <div className="space-y-2">
                <Label htmlFor="note-task">Vincular a uma tarefa (opcional)</Label>
                <Select
                  value={selectedTaskId || "none"}
                  onValueChange={(value) => setSelectedTaskId(value === "none" ? null : value)}
                >
                  <SelectTrigger id="note-task">
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
                  {selectedTagIds.map((tagId) => {
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
                      {tags?.filter(tag => !selectedTagIds.includes(tag.id)).map((tag) => (
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
            </>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSaveNote}
              disabled={!content.trim() || createNote.isPending}
              className="flex-1"
            >
              {createNote.isPending ? "Salvando..." : "Salvar Nota"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Simples" : "Avançado"}
            </Button>
          </div>
        </div>

        {recentNotes.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Notas Recentes</h4>
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="text-sm p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                {note.title && (
                  <div className="font-medium mb-1">{note.title}</div>
                )}
                <div className="text-muted-foreground line-clamp-2">
                  {note.content}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {note.tags.map(({ tag }) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: tag.color || undefined }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {note.task && (
                    <Badge variant="outline" className="text-xs">
                      {note.task.title}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
