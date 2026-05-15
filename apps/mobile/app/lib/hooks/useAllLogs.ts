import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { Protocol, ProtocolLog } from "./useProtocols";

export interface LogWithProtocol extends ProtocolLog {
  protocol: Protocol;
}

export function useAllLogs() {
  return useQuery<LogWithProtocol[]>({
    queryKey: ["all-logs"],
    queryFn: async () => {
      const { data: protocols } = await api.get<Protocol[]>("/protocols");

      const logsPerProtocol = await Promise.all(
        protocols.map(async (protocol) => {
          const { data: logs } = await api.get<ProtocolLog[]>(
            `/protocols/${protocol.id}/logs`,
          );
          return logs.map((log) => ({ ...log, protocol }));
        }),
      );

      return logsPerProtocol
        .flat()
        .sort(
          (a, b) =>
            new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
        );
    },
  });
}
