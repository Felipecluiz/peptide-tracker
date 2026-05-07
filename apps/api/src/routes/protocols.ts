import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function protocolRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ message: "Token inválido ou ausente" });
    }
  });

  // CRIAR PROTOCOLO
  app.post("/", async (request, reply) => {
    const schema = z.object({
      peptideName: z.string(),
      dosageMcg: z.number(),
      frequency: z.string(),
      route: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      notes: z.string().optional(),
    });

    const {
      peptideName,
      dosageMcg,
      frequency,
      route,
      startDate,
      endDate,
      notes,
    } = schema.parse(request.body);
    const userId = (request.user as { sub: string }).sub;

    const protocol = await prisma.protocol.create({
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
    const userId = (request.user as { sub: string }).sub;

    const protocols = await prisma.protocol.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(protocols);
  });

  // DETALHE
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = (request.user as { sub: string }).sub;

    const protocol = await prisma.protocol.findFirst({
      where: { id, userId },
    });

    if (!protocol) {
      return reply.status(404).send({ message: "Protocolo não encontrado" });
    }

    return reply.send(protocol);
  });

  // ATUALIZAR
  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = (request.user as { sub: string }).sub;

    const schema = z.object({
      peptideName: z.string().optional(),
      dosageMcg: z.number().optional(),
      frequency: z.string().optional(),
      route: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isActive: z.boolean().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(request.body);

    const protocol = await prisma.protocol.findFirst({ where: { id, userId } });
    if (!protocol) {
      return reply.status(404).send({ message: "Protocolo não encontrado" });
    }

    const updated = await prisma.protocol.update({
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
    const { id } = request.params as { id: string };
    const userId = (request.user as { sub: string }).sub;

    const protocol = await prisma.protocol.findFirst({ where: { id, userId } });
    if (!protocol) {
      return reply.status(404).send({ message: "Protocolo não encontrado" });
    }

    await prisma.protocol.delete({ where: { id } });

    return reply.status(204).send();
  });
}
