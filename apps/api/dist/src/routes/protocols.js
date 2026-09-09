"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protocolRoutes = protocolRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
async function protocolRoutes(app) {
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            reply.status(401).send({ message: "Token inválido ou ausente" });
        }
    });
    // CRIAR PROTOCOLO
    app.post("/", async (request, reply) => {
        const schema = zod_1.z.object({
            peptideName: zod_1.z.string(),
            dosageMcg: zod_1.z.number(),
            frequency: zod_1.z.string(),
            route: zod_1.z.string(),
            startDate: zod_1.z.string(),
            endDate: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
        });
        const { peptideName, dosageMcg, frequency, route, startDate, endDate, notes, } = schema.parse(request.body);
        const userId = request.user.sub;
        const protocol = await prisma_1.prisma.protocol.create({
            data: {
                userId,
                peptideName,
                dosageMcg,
                frequency,
                route,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
                notes,
            },
        });
        return reply.status(201).send(protocol);
    });
    // LISTAR PROTOCOLOS
    app.get("/", async (request, reply) => {
        const userId = request.user.sub;
        const protocols = await prisma_1.prisma.protocol.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return reply.send(protocols);
    });
    // DETALHE
    app.get("/:id", async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.sub;
        const protocol = await prisma_1.prisma.protocol.findFirst({
            where: { id, userId },
        });
        if (!protocol) {
            return reply.status(404).send({ message: "Protocolo não encontrado" });
        }
        return reply.send(protocol);
    });
    // ATUALIZAR
    app.patch("/:id", async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.sub;
        const schema = zod_1.z.object({
            peptideName: zod_1.z.string().optional(),
            dosageMcg: zod_1.z.number().optional(),
            frequency: zod_1.z.string().optional(),
            route: zod_1.z.string().optional(),
            startDate: zod_1.z.string().optional(),
            endDate: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional(),
            notes: zod_1.z.string().optional(),
        });
        const data = schema.parse(request.body);
        const protocol = await prisma_1.prisma.protocol.findFirst({ where: { id, userId } });
        if (!protocol) {
            return reply.status(404).send({ message: "Protocolo não encontrado" });
        }
        const updated = await prisma_1.prisma.protocol.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
        return reply.send(updated);
    });
    // DELETAR
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.sub;
        const protocol = await prisma_1.prisma.protocol.findFirst({ where: { id, userId } });
        if (!protocol) {
            return reply.status(404).send({ message: "Protocolo não encontrado" });
        }
        await prisma_1.prisma.protocol.delete({ where: { id } });
        return reply.status(204).send();
    });
}
