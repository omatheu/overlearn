import { useQuery } from '@tanstack/react-query';

export interface Concept {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useConcepts() {
  return useQuery({
    queryKey: ['concepts'],
    queryFn: async (): Promise<Concept[]> => {
      const res = await fetch('/api/concepts');
      if (!res.ok) throw new Error('Failed to fetch concepts');
      return res.json();
    }
  });
}
