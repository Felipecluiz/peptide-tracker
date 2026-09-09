"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
async function authRoutes(app) {
    // REGISTER
    app.post("/register", async (request, reply) => {
        const schema = zod_1.z.object({
            name: zod_1.z.string(),
            email: zod_1.z.string().check(zod_1.z.email()),
            password: zod_1.z.string().min(6),
        });
        const { name, email, password } = schema.parse(request.body);
        const userExists = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return reply.status(400).send({ message: "Email already registered" });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: { name, email, password: hash },
        });
        const token = app.jwt.sign({ sub: user.id });
        return reply.status(201).send({ token });
    });
    // LOGIN
    app.post("/login", async (request, reply) => {
        const schema = zod_1.z.object({
            email: zod_1.z.string().check(zod_1.z.email()),
            password: zod_1.z.string(),
        });
        const { email, password } = schema.parse(request.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return reply.status(401).send({ message: "Invalid credentials" });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            return reply.status(401).send({ message: "Invalid credentials" });
        }
        const token = app.jwt.sign({ sub: user.id });
        return reply.send({ token });
    });
}
