// Measures database speed: npm run db:ping
// Prints the time for a connection and for a few tiny queries (round trips).
import "dotenv/config";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const host = new URL(process.env.DATABASE_URL!).hostname;
  const t0 = Date.now();
  await client.connect();
  console.log(`Connected to ${host} in ${Date.now() - t0} ms`);
  const times: number[] = [];
  for (let i = 0; i < 6; i++) {
    const t = Date.now();
    await client.query("select 1");
    times.push(Date.now() - t);
  }
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  console.log(`Query round trips (ms): ${times.join(", ")}  →  average ${avg} ms`);
  console.log(avg < 120 ? "Fast: pages will feel instant." : avg < 250 ? "OK." : "Slow: the database is far from you. Pick a closer region.");
  await client.end();
}

main().catch((e) => {
  console.error("Ping failed:", e.message);
  process.exitCode = 1;
});
