import { migrate } from './migrate.js';
import { seedIfEmpty } from './seed.js';
import { createApp } from './app.js';

migrate();
const seedResult = seedIfEmpty();
console.log('[fcc] db ready · seed:', seedResult);

const app = createApp();
const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`[fcc] api listening on http://localhost:${PORT}`));
