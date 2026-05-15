import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export interface Protocol {
  id: string;
  peptideName: string;
  dosageMcg: number;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface ProtocolLog {
  id: string;
  protocolId: string;
  doseTaken: number;
  loggedAt: string;
  notes?: string;
}

// LISTAR
export function useProtocols() {
  return useQuery<Protocol[]>({
    queryKey: ["protocols"],
    queryFn: async () => {
      const { data } = await api.get("/protocols");
      return data;
    },
  });
}

// DETALHE
export function useProtocol(id: string) {
  return useQuery<Protocol>({
    queryKey: ["protocols", id],
    queryFn: async () => {
      const { data } = await api.get(`/protocols/${id}`);
      return data;
    },
  });
}

// CRIAR
export function useCreateProtocol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: Omit<Protocol, "id" | "isActive" | "createdAt">,
    ) => {
      const { data } = await api.post("/protocols", body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["protocols"] }),
  });
}

// DELETAR
export function useDeleteProtocol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/protocols/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["protocols"] }),
  });
}

// LOGS
export function useLogs(protocolId: string) {
  return useQuery<ProtocolLog[]>({
    queryKey: ["logs", protocolId],
    queryFn: async () => {
      const { data } = await api.get(`/protocols/${protocolId}/logs`);
      return data;
    },
  });
}

// CRIAR LOG
export function useCreateLog(protocolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { doseTaken: number; notes?: string }) => {
      const { data } = await api.post(`/protocols/${protocolId}/logs`, body);
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["logs", protocolId] }),
  });
}

// DELETAR LOG
export function useDeleteLog(protocolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logId: string) => {
      await api.delete(`/protocols/${protocolId}/logs/${logId}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["logs", protocolId] }),
  });
}
