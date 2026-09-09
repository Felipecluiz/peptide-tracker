import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export interface Biomarker {
  id: string;
  examId: string;
  name: string;
  value: number;
  unit: string;
  refMin?: number;
  refMax?: number;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  fileUrl?: string;
  fileType?: string;
  examDate: string;
  notes?: string;
  createdAt: string;
  biomarkers: Biomarker[];
}

export interface BiomarkerEvolution extends Biomarker {
  exam: { examDate: string; title: string };
}

export function useExams() {
  return useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => (await api.get("/exams")).data,
  });
}

export function useExam(id: string) {
  return useQuery<Exam>({
    queryKey: ["exams", id],
    queryFn: async () => (await api.get(`/exams/${id}`)).data,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Omit<Exam, "id" | "createdAt">) =>
      (await api.post("/exams", body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => await api.delete(`/exams/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useBiomarkerEvolution(name: string) {
  return useQuery<BiomarkerEvolution[]>({
    queryKey: ["biomarker-evolution", name],
    queryFn: async () =>
      (await api.get(`/exams/biomarkers/${encodeURIComponent(name)}/evolution`))
        .data,
    enabled: !!name,
  });
}

export function useBiomarkerNames() {
  return useQuery<{ name: string; unit: string }[]>({
    queryKey: ["biomarker-names"],
    queryFn: async () => (await api.get("/exams/biomarkers/names")).data,
  });
}

export function useAnalyzeExam() {
  return useMutation({
    mutationFn: async (examId: string) =>
      (await api.post(`/exams/${examId}/analyze`)).data as {
        content: string;
        cached: boolean;
      },
  });
}
export interface ExtractedBiomarker {
  name: string;
  value: number;
  unit: string;
  refMin?: number;
  refMax?: number;
}

export interface ExtractedExam {
  title: string;
  examDate?: string;
  biomarkers: ExtractedBiomarker[];
}

export function useExtractExam() {
  return useMutation({
    mutationFn: async ({
      base64Image,
      mimeType,
    }: {
      base64Image: string;
      mimeType: string;
    }) =>
      (await api.post("/exams/extract", { base64Image, mimeType }))
        .data as ExtractedExam,
  });
}
