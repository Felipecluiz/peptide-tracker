import { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

export async function authRoutes(app: FastifyInstance) {
  // REGISTER
  app.post("/register", async (request, reply) => {
    const schema = z.object({
      name: z.string(),
      email: z.string().check(z.email()),
      password: z.string().min(6),
    });

    const { name, email, password } = schema.parse(request.body);

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return reply.status(400).send({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hash },
    });

    const token = app.jwt.sign({ sub: user.id });

    return reply.status(201).send({ token });
  });

  // LOGIN
  app.post("/login", async (request, reply) => {
    const schema = z.object({
      email: z.string().check(z.email()),
      password: z.string(),
    });

    const { email, password } = schema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    const token = app.jwt.sign({ sub: user.id });

    return reply.send({ token });
  });
}
