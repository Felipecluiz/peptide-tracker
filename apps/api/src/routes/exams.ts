import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { analyzeBiomarkers } from "../lib/ai";
import { extractExamFromImage } from "../lib/gemini";

export async function examRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ message: "Token inválido ou ausente" });
    }
  });

  // EXTRAIR EXAME DE UMA IMAGEM (OCR com IA)
  app.post("/extract", async (request, reply) => {
    const schema = z.object({
      base64Image: z.string(),
      mimeType: z.string().default("image/jpeg"),
    });

    const { base64Image, mimeType } = schema.parse(request.body);

    try {
      const extracted = await extractExamFromImage(base64Image, mimeType);
      return reply.send(extracted);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        message:
          "Não foi possível extrair os dados da imagem. Tente novamente ou preencha manualmente.",
      });
    }
  });

  // CRIAR EXAME + BIOMARCADORES
  app.post("/", async (request, reply) => {
    const schema = z.object({
      title: z.string(),
      fileUrl: z.string().optional(),
      fileType: z.string().optional(),
      examDate: z.string(),
      notes: z.string().optional(),
      biomarkers: z
        .array(
          z.object({
            name: z.string(),
            value: z.number(),
            unit: z.string(),
            refMin: z.number().optional(),
            refMax: z.number().optional(),
          }),
        )
        .optional(),
    });

    const { title, fileUrl, fileType, examDate, notes, biomarkers } =
      schema.parse(request.body);
    const userId = (request.user as { sub: string }).sub;

    const exam = await prisma.exam.create({
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
    const userId = (request.user as { sub: string }).sub;

    const exams = await prisma.exam.findMany({
      where: { userId },
      include: { biomarkers: true },
      orderBy: { examDate: "desc" },
    });

    return reply.send(exams);
  });

  // DETALHE
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = (request.user as { sub: string }).sub;

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
      include: { biomarkers: true },
    });

    if (!exam)
      return reply.status(404).send({ message: "Exame não encontrado" });

    return reply.send(exam);
  });

  // DELETAR EXAME
  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = (request.user as { sub: string }).sub;

    const exam = await prisma.exam.findFirst({ where: { id, userId } });
    if (!exam)
      return reply.status(404).send({ message: "Exame não encontrado" });

    await prisma.exam.delete({ where: { id } });
    return reply.status(204).send();
  });

  // ANALISAR EXAME COM IA
  app.post("/:id/analyze", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = (request.user as { sub: string }).sub;

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
      include: { biomarkers: true, analysis: true },
    });

    if (!exam)
      return reply.status(404).send({ message: "Exame não encontrado" });

    if (!exam.biomarkers.length) {
      return reply
        .status(400)
        .send({ message: "Este exame não possui biomarcadores para analisar" });
    }

    if (exam.analysis) {
      return reply.send({ content: exam.analysis.content, cached: true });
    }

    try {
      const content = await analyzeBiomarkers(
        exam.biomarkers,
        exam.title,
        exam.examDate.toISOString(),
      );

      const analysis = await prisma.examAnalysis.create({
        data: { examId: id, content },
      });

      return reply.send({ content: analysis.content, cached: false });
    } catch (error) {
      request.log.error(error);
      return reply
        .status(500)
        .send({ message: "Não foi possível gerar a análise. Tente novamente." });
    }
  });

  // EVOLUÇÃO DE UM BIOMARCADOR (ex: todos os IGF-1 do usuário)
  app.get("/biomarkers/:name/evolution", async (request, reply) => {
    const { name } = request.params as { name: string };
    const userId = (request.user as { sub: string }).sub;

    const biomarkers = await prisma.biomarker.findMany({
      where: { name, exam: { userId } },
      include: { exam: { select: { examDate: true, title: true } } },
      orderBy: { exam: { examDate: "asc" } },
    });

    return reply.send(biomarkers);
  });

  // LISTAR NOMES ÚNICOS DE BIOMARCADORES DO USUÁRIO
  app.get("/biomarkers/names", async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;

    const biomarkers = await prisma.biomarker.findMany({
      where: { exam: { userId } },
      select: { name: true, unit: true },
      distinct: ["name"],
    });

    return reply.send(biomarkers);
  });
}