import React, { createContext, useContext, useEffect, useState } from 'react';

type ProgressMap = { [classId: string]: number };

interface ClassProgressContextType {
  progress: ProgressMap;
  setClassProgress: (classId: string, value: number) => void;
  addProgress: (classId: string, increment?: number) => boolean;
  resetAll: () => void;
}

const ClassProgressContext = createContext<ClassProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'classProgress_v1';

const INITIAL: ProgressMap = {
  'caral-ciudad': 0,
  'pre-inca': 0,
  'cultura-inca': 0,
  'virreinato': 0,
  'independencia': 0,
  'batalla-angamos': 0,
};

export const ClassProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL;
      const parsed = JSON.parse(raw) as ProgressMap;
      return { ...INITIAL, ...parsed };
    } catch {
      return INITIAL;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  const setClassProgress = (classId: string, value: number) => {
    setProgress(prev => ({ ...prev, [classId]: Math.min(100, Math.max(0, Math.round(value))) }));
  };

  const addProgress = (classId: string, increment = 10): boolean => {
    let progressAdded = false;
    setProgress(prev => {
      const current = prev[classId] ?? 0;
      const newProgress = Math.min(100, current + increment);
      progressAdded = newProgress > current;
      return { ...prev, [classId]: newProgress };
    });
    return progressAdded;
  };

  const resetAll = () => setProgress(INITIAL);

  return (
    <ClassProgressContext.Provider value={{ progress, setClassProgress, addProgress, resetAll }}>
      {children}
    </ClassProgressContext.Provider>
  );
};

export const useClassProgress = () => {
  const ctx = useContext(ClassProgressContext);
  if (!ctx) throw new Error('useClassProgress must be used within ClassProgressProvider');
  return ctx;
};
