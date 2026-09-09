"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examRoutes = examRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
async function examRoutes(app) {
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            reply.status(401).send({ message: "Token inválido ou ausente" });
        }
    });
    app.post("/", async (request, reply) => {
        const schema = zod_1.z.object({
            title: zod_1.z.string(),
            fileUrl: zod_1.z.string().optional(),
            fileType: zod_1.z.string().optional(),
            examDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: "Data inválida",
            }),
            notes: zod_1.z.string().optional(),
            biomarkers: zod_1.z
                .array(zod_1.z.object({
                name: zod_1.z.string(),
                value: zod_1.z.number(),
                unit: zod_1.z.string(),
                refMin: zod_1.z.number().optional(),
                refMax: zod_1.z.number().optional(),
            }))
                .optional(),
        });
        const parsed = schema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                message: "Dados inválidos",
                errors: parsed.error.flatten(),
            });
        }
        const { title, fileUrl, fileType, examDate, notes, biomarkers } = parsed.data;
        const userId = request.user.sub;
        const exam = await prisma_1.prisma.exam.create({
            data: {
                userId,
                title,
                fileUrl,
                fileType,
                examDate: new Date(examDate),
                notes,
                biomarkers: biomarkers ? { create: biomarkers } : undefined,
            },
            include: { biomarkers: true },
        });
        return reply.status(201).send(exam);
    });
    // LISTAR EXAMES
    app.get("/", async (request, reply) => {
        const userId = request.user.sub;
        const exams = await prisma_1.prisma.exam.findMany({
            where: { userId },
            include: { biomarkers: true },
            orderBy: { examDate: "desc" },
        });
        return reply.send(exams);
    });
    // DETALHE
    app.get("/:id", async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.sub;
        const exam = await prisma_1.prisma.exam.findFirst({
            where: { id, userId },
            include: { biomarkers: true },
        });
        if (!exam)
            return reply.status(404).send({ message: "Exame não encontrado" });
        return reply.send(exam);
    });
    // DELETAR EXAME
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.sub;
        const exam = await prisma_1.prisma.exam.findFirst({ where: { id, userId } });
        if (!exam)
            return reply.status(404).send({ message: "Exame não encontrado" });
        await prisma_1.prisma.exam.delete({ where: { id } });
        return reply.status(204).send();
    });
    // EVOLUÇÃO DE UM BIOMARCADOR (ex: todos os IGF-1 do usuário)
    app.get("/biomarkers/:name/evolution", async (request, reply) => {
        const { name } = request.params;
        const userId = request.user.sub;
        const biomarkers = await prisma_1.prisma.biomarker.findMany({
            where: { name, exam: { userId } },
            include: { exam: { select: { examDate: true, title: true } } },
            orderBy: { exam: { examDate: "asc" } },
        });
        return reply.send(biomarkers);
    });
    // LISTAR NOMES ÚNICOS DE BIOMARCADORES DO USUÁRIO
    app.get("/biomarkers/names", async (request, reply) => {
        const userId = request.user.sub;
        const biomarkers = await prisma_1.prisma.biomarker.findMany({
            where: { exam: { userId } },
            select: { name: true, unit: true },
            distinct: ["name"],
        });
        return reply.send(biomarkers);
    });
}
