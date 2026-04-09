import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

// Generic fetcher
export const useFetch = <T>(key: string[], url: string, options = {}) =>
  useQuery<T>({ queryKey: key, queryFn: () => api.get(url).then(r => r.data), ...options });

// Teachers
export const useTeachers = () => useFetch<any[]>(['teachers'], '/teachers');
export const useStudents = () => useFetch<any[]>(['students'], '/students');
export const useClasses  = () => useFetch<any[]>(['classes'], '/classes');
export const useSubjects = () => useFetch<any[]>(['subjects'], '/subjects');
export const useNotices  = () => useFetch<any[]>(['notices'], '/notices');
export const useComplaints = () => useFetch<any[]>(['complaints'], '/complaints');
export const useMaterials  = () => useFetch<any[]>(['materials'], '/materials');
export const useMarks    = () => useFetch<any[]>(['marks'], '/marks');
export const useAttendance = (params = '') => 
  useFetch<any[]>(['attendance', params], `/attendance${params}`);
export const useFees = () => useFetch<any[]>(['fees'], '/fees');
export const useFeeSummary = () => useFetch<any>(['fee-summary'], '/fees/summary');
export const useSubmissions = (assignmentId: string) => 
  useFetch<any[]>(['submissions', assignmentId], `/submissions?assignmentId=${assignmentId}`);
export const useMySubmission = (assignmentId: string) => 
  useFetch<any>(['my-submission', assignmentId], `/submissions/my?assignmentId=${assignmentId}`);
export const useTimetable = (classId: string) => 
  useFetch<any[]>(['timetable', classId], `/timetable/${classId}`);
export const useUpdateSubmissionMutation = (id: string, assignmentId: string) => {

  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.put(`/submissions/${id}/grade`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submissions', assignmentId] })
  });
};

export const useCreateMutation = (url: string, invalidateKey: string[]) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post(url, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey })
  });
};

export const useDeleteMutation = (url: string, invalidateKey: string[]) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${url}/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey })
  });
};
