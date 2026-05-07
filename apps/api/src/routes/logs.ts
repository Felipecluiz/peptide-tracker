import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function logRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ message: "Token inválido ou ausente" });
    }
  });

  // REGISTRAR LOG
  app.post("/:protocolId/logs", async (request, reply) => {
    const { protocolId } = request.params as { protocolId: string };
    const userId = (request.user as { sub: string }).sub;

    const schema = z.object({
      doseTaken: z.number(),
      loggedAt: z.string().optional(),
      notes: z.string().optional(),
    });

    const { doseTaken, loggedAt, notes } = schema.parse(request.body);

    // Verifica se o protocolo pertence ao usuário
    const protocol = await prisma.protocol.findFirst({
      where: { id: protocolId, userId },
    });

    if (!protocol) {
      return reply.status(404).send({ message: "Protocolo não encontrado" });
    }

    const log = await prisma.protocolLog.create({
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
    const { protocolId } = request.params as { protocolId: string };
    const userId = (request.user as { sub: string }).sub;

    const protocol = await prisma.protocol.findFirst({
      where: { id: protocolId, userId },
    });

    if (!protocol) {
      return reply.status(404).send({ message: "Protocolo não encontrado" });
    }

    const logs = await prisma.protocolLog.findMany({
      where: { protocolId },
      orderBy: { loggedAt: "desc" },
    });

    return reply.send(logs);
  });

  // DELETAR LOG
  app.delete("/:protocolId/logs/:logId", async (request, reply) => {
    const { protocolId, logId } = request.params as {
      protocolId: string;
      logId: string;
    };
    const userId = (request.user as { sub: string }).sub;

    const protocol = await prisma.protocol.findFirst({
      where: { id: protocolId, userId },
    });

    if (!protocol) {
      return reply.status(404).send({ message: "Protocolo não encontrado" });
    }

    await prisma.protocolLog.delete({ where: { id: logId } });

    return reply.status(204).send();
  });
}
