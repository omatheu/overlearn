// src/lib/atoms/index.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// UI State
export const sidebarOpenAtom = atomWithStorage('sidebar-open', true);
export const darkModeAtom = atomWithStorage('dark-mode', false);

// User Profile (carrega do banco, mas mantém em memória)
export const userProfileAtom = atom<{ id: string; name: string; email: string } | null>(null);

// Current selections
export const selectedTaskAtom = atom<string | null>(null);
export const selectedFlashcardAtom = atom<string | null>(null);

// Timer
export const timerActiveAtom = atom(false);
export const timerSecondsAtom = atom(0);
export const timerTypeAtom = atom<'work' | 'break'>('work');