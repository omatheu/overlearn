'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteButton() {
  return (
    <Button
      variant="destructive"
      size="sm"
      type="submit"
      onClick={(e) => {
        if (!confirm('Tem certeza que deseja deletar esta task?')) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Deletar
    </Button>
  );
}
