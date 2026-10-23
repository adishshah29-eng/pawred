// Creates (or updates) the Supabase Storage buckets: npm run setup:storage
// Safe to re-run. Kept outside Prisma migrations because the `storage` schema
// belongs to Supabase, not to this app.
//
//   dog-photos   public  · 5 MB · jpg/png/webp   (shown on profiles)
//   health-docs  private · 10 MB · pdf/jpg/png/webp (the app itself caps docs at 4 MB)
//
// No storage policies are added, so the publishable key can't upload or list.
// The app uploads on the server with SUPABASE_SERVICE_ROLE_KEY.
import "dotenv/config";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(
      `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
        ('dog-photos', 'dog-photos', true, 5242880, array['image/jpeg','image/png','image/webp']),
        ('health-docs', 'health-docs', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
       on conflict (id) do update set
         public = excluded.public,
         file_size_limit = excluded.file_size_limit,
         allowed_mime_types = excluded.allowed_mime_types`,
    );
    const { rows } = await client.query(`select id, public from storage.buckets where id in ('dog-photos','health-docs')`);
    console.log("Buckets ready:", rows.map((r) => `${r.id}${r.public ? " (public)" : " (private)"}`).join(", "));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Storage setup failed:", err.message);
  process.exitCode = 1;
});
