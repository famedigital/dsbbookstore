/**
 * Keep running enrich-book-metadata until the queue is empty.
 * Usage: node scripts/enrich-book-metadata-loop.mjs [--limit=200] [--ai]
 */
import { spawn } from "node:child_process";

const limitArg =
  process.argv.find((a) => a.startsWith("--limit=")) || "--limit=200";
const extra = process.argv.filter(
  (a) => a !== "--limit=" && !a.startsWith("--limit=") && a !== process.argv[1]
).filter((a) => a.startsWith("--") && !a.startsWith("--limit="));

let round = 0;
let totalUpdated = 0;
let totalSkipped = 0;

function runOnce() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["scripts/enrich-book-metadata.mjs", limitArg, ...extra],
      { stdio: ["ignore", "pipe", "pipe"] }
    );
    let out = "";
    child.stdout.on("data", (d) => {
      const s = d.toString();
      out += s;
      process.stdout.write(s);
    });
    child.stderr.on("data", (d) => process.stderr.write(d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`enrich exited ${code}`));
        return;
      }
      resolve(out);
    });
  });
}

for (;;) {
  round += 1;
  console.log(`\n=== enrich round ${round} ===`);
  const out = await runOnce();
  const head = out.match(/needing:\s*(\d+)/);
  const proc = out.match(/processing:\s*(\d+)/);
  const updated = out.match(/updated:\s*(\d+)/g);
  const lastStats = [...out.matchAll(/\{ updated: (\d+), skipped: (\d+), errors: (\d+)/g)].pop();
  const needing = head ? Number(head[1]) : null;
  const processing = proc ? Number(proc[1]) : null;
  if (lastStats) {
    totalUpdated += Number(lastStats[1]);
    totalSkipped += Number(lastStats[2]);
  }
  console.log({
    round,
    needing,
    processing,
    totalUpdated,
    totalSkipped,
  });
  if (!processing || processing === 0) {
    console.log("Done — no more books need enrichment.");
    break;
  }
  if (needing !== null && needing === 0) {
    console.log("Done — needing queue empty.");
    break;
  }
}

console.log({ rounds: round, totalUpdated, totalSkipped });
