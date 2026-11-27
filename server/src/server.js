import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import authService from "./services/auth.service.js";

await connectDB();
await authService.ensureAdmin();
app.listen(env.port, () => console.log(`Server running on ${env.serverUrl}`));
