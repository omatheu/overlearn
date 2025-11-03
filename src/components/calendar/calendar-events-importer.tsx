'use client';

import { useRef, useState, type ChangeEvent } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useScheduledEvents } from '@/services/calendar';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface CalendarEventsImporterProps {
  className?: string;
  title?: string;
  description?: string;
}

export function CalendarEventsImporter({
  className,
  title = 'Importar Eventos do Google Calendar',
  description = 'Selecione um arquivo .ics exportado do Google Calendar para importar eventos. Eventos com o mesmo UID são ignorados automaticamente.'
}: CalendarEventsImporterProps) {
  const { importFromICS } = useScheduledEvents();
  const [isImporting, setIsImporting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);
    setFeedbackMessage(null);
    setErrorMessage(null);

    try {
      const content = await file.text();
      const importedEvents = importFromICS(content);

      if (importedEvents.length === 0) {
        setFeedbackMessage('Nenhum evento novo foi encontrado no arquivo.');
      } else {
        const importedCount = importedEvents.length;
        setFeedbackMessage(`Importamos ${importedCount} evento${importedCount > 1 ? 's' : ''}.`);
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Não foi possível importar o arquivo .ics.';
      setErrorMessage(message);
    } finally {
      setIsImporting(false);
      resetFileInput();
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".ics,text/calendar"
          disabled={isImporting}
          onChange={handleFileChange}
        />
        {isImporting && (
          <p className="text-xs text-muted-foreground">Importando eventos...</p>
        )}
        {feedbackMessage && (
          <p className="text-xs text-green-600">{feedbackMessage}</p>
        )}
        {errorMessage && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

