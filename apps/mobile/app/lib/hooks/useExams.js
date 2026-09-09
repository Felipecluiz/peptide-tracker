"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExams = useExams;
exports.useExam = useExam;
exports.useCreateExam = useCreateExam;
exports.useDeleteExam = useDeleteExam;
exports.useBiomarkerEvolution = useBiomarkerEvolution;
exports.useBiomarkerNames = useBiomarkerNames;
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("../api");
function useExams() {
    return (0, react_query_1.useQuery)({
        queryKey: ["exams"],
        queryFn: async () => (await api_1.api.get("/exams")).data,
    });
}
function useExam(id) {
    return (0, react_query_1.useQuery)({
        queryKey: ["exams", id],
        queryFn: async () => (await api_1.api.get(`/exams/${id}`)).data,
    });
}
function useCreateExam() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (body) => (await api_1.api.post("/exams", body)).data,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
    });
}
function useDeleteExam() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (id) => await api_1.api.delete(`/exams/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
    });
}
function useBiomarkerEvolution(name) {
    return (0, react_query_1.useQuery)({
        queryKey: ["biomarker-evolution", name],
        queryFn: async () => (await api_1.api.get(`/exams/biomarkers/${encodeURIComponent(name)}/evolution`))
            .data,
        enabled: !!name,
    });
}
function useBiomarkerNames() {
    return (0, react_query_1.useQuery)({
        queryKey: ["biomarker-names"],
        queryFn: async () => (await api_1.api.get("/exams/biomarkers/names")).data,
    });
}
