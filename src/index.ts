import { App } from "./app.js";
import { ensureDefaultCategories } from "./utils/seed-defaults.js";

async function bootstrap() {
  await ensureDefaultCategories();
  const app = new App();
  app.start();
}

bootstrap();
