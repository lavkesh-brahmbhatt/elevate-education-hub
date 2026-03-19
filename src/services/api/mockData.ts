
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export interface MockData {
  schools: Tables['schools']['Row'][];
  profiles: Tables['profiles']['Row'][];
  classes: Tables['classes']['Row'][];
  subjects: Tables['subjects']['Row'][];
  enrollments: Tables['enrollments']['Row'][];
  parent_student_links: Tables['parent_student_links']['Row'][];
  attendance: Tables['attendance']['Row'][];
  marks: Tables['marks']['Row'][];
  assignments: Tables['assignments']['Row'][];
  submissions: Tables['submissions']['Row'][];
  notices: Tables['notices']['Row'][];
  complaints: Tables['complaints']['Row'][];
}

const STORAGE_KEY = 'school_management_demo_data';

import largeData from './largeMockData.json';

export const generateInitialData = (): MockData => {
  return largeData as unknown as MockData;
};

export const getStoredData = (): MockData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load stored mock data', e);
  }
  const initial = generateInitialData();
  saveData(initial);
  return initial;
};

export const saveData = (data: MockData) => {
  try {
    const serialized = JSON.stringify(data);
    // Only save if it's within typical localStorage limits (~5MB)
    if (serialized.length < 4500000) { 
      localStorage.setItem(STORAGE_KEY, serialized);
    } else {
      console.warn('Mock data too large to persist in localStorage, updates wont persist across reloads.');
    }
  } catch (e) {
    console.error('Failed to save mock data to localStorage', e);
  }
};
