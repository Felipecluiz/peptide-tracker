import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth";
import { protocolRoutes } from "./routes/protocols";
import { logRoutes } from "./routes/logs";
import { examRoutes } from "./routes/exams";
const app = fastify();

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET as string,
});
app.register(examRoutes, { prefix: "/exams" });

app.register(authRoutes);
app.register(protocolRoutes, { prefix: "/protocols" });
app.register(logRoutes, { prefix: "/protocols" });

app.listen(
  { port: Number(process.env.PORT) || 3333, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`🚀 Server running at ${address}`);
  },
);
