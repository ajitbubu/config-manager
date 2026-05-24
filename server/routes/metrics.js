import { Router } from 'express';

const HOURS = 48;
const ring = new Array(HOURS).fill(0);
let lastBucketHour = Math.floor(Date.now() / 3_600_000);
let rotationOffset = 0;

function rotate() {
  const nowHour = Math.floor(Date.now() / 3_600_000);
  const delta = nowHour - lastBucketHour;
  if (delta <= 0) return;
  for (let i = 0; i < Math.min(delta, HOURS); i++) {
    rotationOffset = (rotationOffset + 1) % HOURS;
    ring[rotationOffset] = 0;
  }
  lastBucketHour = nowHour;
}

export function metricsRecord() {
  rotate();
  ring[rotationOffset] += 1;
}

export const metricsRouter = Router();

metricsRouter.get('/fetches', (req, res) => {
  rotate();
  const out = [];
  for (let i = 1; i <= HOURS; i++) out.push(ring[(rotationOffset + i) % HOURS]);
  res.json({ hours: HOURS, fetches: out });
});
