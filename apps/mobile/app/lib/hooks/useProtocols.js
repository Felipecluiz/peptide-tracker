"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProtocols = useProtocols;
exports.useProtocol = useProtocol;
exports.useCreateProtocol = useCreateProtocol;
exports.useDeleteProtocol = useDeleteProtocol;
exports.useLogs = useLogs;
exports.useCreateLog = useCreateLog;
exports.useDeleteLog = useDeleteLog;
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("../api");
// LISTAR
function useProtocols() {
    return (0, react_query_1.useQuery)({
        queryKey: ["protocols"],
        queryFn: async () => {
            const { data } = await api_1.api.get("/protocols");
            return data;
        },
    });
}
// DETALHE
function useProtocol(id) {
    return (0, react_query_1.useQuery)({
        queryKey: ["protocols", id],
        queryFn: async () => {
            const { data } = await api_1.api.get(`/protocols/${id}`);
            return data;
        },
    });
}
// CRIAR
function useCreateProtocol() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (body) => {
            const { data } = await api_1.api.post("/protocols", body);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["protocols"] }),
    });
}
// DELETAR
function useDeleteProtocol() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (id) => {
            await api_1.api.delete(`/protocols/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["protocols"] }),
    });
}
// LOGS
function useLogs(protocolId) {
    return (0, react_query_1.useQuery)({
        queryKey: ["logs", protocolId],
        queryFn: async () => {
            const { data } = await api_1.api.get(`/protocols/${protocolId}/logs`);
            return data;
        },
    });
}
// CRIAR LOG
function useCreateLog(protocolId) {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (body) => {
            const { data } = await api_1.api.post(`/protocols/${protocolId}/logs`, body);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["logs", protocolId] }),
    });
}
// DELETAR LOG
function useDeleteLog(protocolId) {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (logId) => {
            await api_1.api.delete(`/protocols/${protocolId}/logs/${logId}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["logs", protocolId] }),
    });
}
