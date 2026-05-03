import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth";

const app = fastify();

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET as string,
});

app.register(authRoutes);

app.listen({ port: Number(process.env.PORT) || 3333 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
