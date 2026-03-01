import app from "./app.mjs";
import { initDb } from "./storage/db.mjs";

const PORT = process.env.PORT || 3000;

await initDb();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});