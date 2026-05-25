import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'fcc-test-'));
process.env.FCC_DB_PATH = join(dir, 'fcc.db');
