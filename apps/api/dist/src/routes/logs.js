"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRoutes = logRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
async function logRoutes(app) {
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            reply.status(401).send({ message: "Token inválido ou ausente" });
        }
    });
    // REGISTRAR LOG
    app.post("/:protocolId/logs", async (request, reply) => {
        const { protocolId } = request.params;
        const userId = request.user.sub;
        const schema = zod_1.z.object({
            doseTaken: zod_1.z.number(),
            loggedAt: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
        });
        const { doseTaken, loggedAt, notes } = schema.parse(request.body);
        // Verifica se o protocolo pertence ao usuário
        const protocol = await prisma_1.prisma.protocol.findFirst({
            where: { id: protocolId, userId },
        });
        if (!protocol) {
            return reply.status(404).send({ message: "Protocolo não encontrado" });
        }
        const log = await prisma_1.prisma.protocolLog.create({
            data: {
                protocolId,
                doseTaken,
                loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
                notes,
            },
        });
        return reply.status(201).send(log);
    });
    // LISTAR LOGS DE UM PROTOCOLO
    app.get("/:protocolId/logs", async (request, reply) => {
        const { protocolId } = request.params;
        const userId = request.user.sub;
        const protocol = await prisma_1.prisma.protocol.findFirst({
            where: { id: protocolId, userId },
        });
        if (!protocol) {
            return reply.status(404).send({ message: "Protocolo não encontrado" });
        }
        const logs = await prisma_1.prisma.protocolLog.findMany({
            where: { protocolId },
            orderBy: { loggedAt: "desc" },
        });
        return reply.send(logs);
    });
    // DELETAR LOG
    app.delete("/:protocolId/logs/:logId", async (request, reply) => {
        const { protocolId, logId } = request.params;
        const userId = request.user.sub;
        const protocol = await prisma_1.prisma.protocol.findFirst({
            where: { id: protocolId, userId },
        });
        if (!protocol) {
            return reply.status(404).send({ message: "Protocolo não encontrado" });
        }
        await prisma_1.prisma.protocolLog.delete({ where: { id: logId } });
        return reply.status(204).send();
    });
}
