import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TechStack {
  id: string;
  technology: string;
  category: string;
  proficiencyLevel: string;
  userProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  yearsOfExperience: number | null;
  currentRole: string | null;
  professionalGoal: string | null;
  workHoursStart: string;
  workHoursEnd: string;
  pomodoroMinutes: number;
  breakMinutes: number;
  createdAt: string;
  updatedAt: string;
  techStack?: TechStack[];
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useTechStack() {
  return useQuery({
    queryKey: ['tech-stack'],
    queryFn: async (): Promise<TechStack[]> => {
      const res = await fetch('/api/tech-stack');
      if (!res.ok) throw new Error('Failed to fetch tech stack');
      return res.json();
    }
  });
}

export function useAddTechStack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      technology: string;
      category: string;
      proficiencyLevel: string;
    }): Promise<TechStack> => {
      const res = await fetch('/api/tech-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add technology');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-stack'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useUpdateTechStack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      technology?: string;
      category?: string;
      proficiencyLevel?: string;
    }): Promise<TechStack> => {
      const res = await fetch(`/api/tech-stack/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Failed to update technology');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-stack'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useDeleteTechStack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string; id: string }> => {
      const res = await fetch(`/api/tech-stack/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete technology');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tech-stack'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}
