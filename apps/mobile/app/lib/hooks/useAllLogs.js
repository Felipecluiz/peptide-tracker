"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAllLogs = useAllLogs;
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("../api");
function useAllLogs() {
    return (0, react_query_1.useQuery)({
        queryKey: ["all-logs"],
        queryFn: async () => {
            const { data: protocols } = await api_1.api.get("/protocols");
            const logsPerProtocol = await Promise.all(protocols.map(async (protocol) => {
                const { data: logs } = await api_1.api.get(`/protocols/${protocol.id}/logs`);
                return logs.map((log) => ({ ...log, protocol }));
            }));
            return logsPerProtocol
                .flat()
                .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
        },
    });
}
