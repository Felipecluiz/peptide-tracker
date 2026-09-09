"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cors_1 = __importDefault(require("@fastify/cors"));
const auth_1 = require("./routes/auth");
const protocols_1 = require("./routes/protocols");
const logs_1 = require("./routes/logs");
const exams_1 = require("./routes/exams");
const app = (0, fastify_1.default)({ logger: true });
app.register(cors_1.default, {
    origin: true,
});
app.register(jwt_1.default, {
    secret: process.env.JWT_SECRET,
});
app.register(exams_1.examRoutes, { prefix: "/exams" });
app.register(auth_1.authRoutes);
app.register(protocols_1.protocolRoutes, { prefix: "/protocols" });
app.register(logs_1.logRoutes, { prefix: "/protocols" });
app.listen({ port: Number(process.env.PORT) || 3333, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 Server running at ${address}`);
});
