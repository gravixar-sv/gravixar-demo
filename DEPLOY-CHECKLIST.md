# DEPLOY-CHECKLIST.md, gravixar-demo

Run-once steps to take this from "code pushed" to "demo.gravixar.com is live with real data."

## 1. Generate auth secret

```powershell
cd "C:\dev\gravixar-demo"
$secret = [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
echo $secret
```

Copy the output (~64 hex chars).

## 2. Set production env vars in Vercel

In `https://vercel.com/gravixar-svs-projects/gravixar-demo` → Settings → Environment Variables, add:

| Variable | Value | Environments |
|---|---|---|
| `NEXTAUTH_SECRET` | the secret you generated | Production + Preview + Development |
| `NEXTAUTH_URL` | `https://gravixar-demo-git-main-gravixar-svs-projects.vercel.app` (until the demo.gravixar.com domain is attached) | Production |
| `GRAVIXAR_DEMO_MODE` | `true` | All environments |
| `CRON_SECRET` | another random hex string (same `[guid]::NewGuid` trick) | Production + Preview |

`AI_GATEWAY_API_KEY` and `RESEND_API_KEY` are NOT needed for Phase 2a, they come in Phase 3 when ECHO and lead-emails wire up.

## 3. Pull the new env vars locally

```powershell
vercel env pull .env.local
```

Verify:
```powershell
Select-String -Pattern "^(DATABASE_URL|NEXTAUTH_SECRET|GRAVIXAR_DEMO_MODE)" .env.local
```

You should see all three names present.

## 4. Push the schema to Neon (one-time)

```powershell
cd "C:\dev\gravixar-demo"
pnpm db:push
```

Expected output:
```
The database is now in sync with your Prisma schema.
```

This creates the tables. Skipping `prisma migrate` because demos don't need migration history, `db push` is the right tool.

## 5. Seed the canonical data

```powershell
pnpm db:seed
```

Expected output:
```
Wiping existing data…
Seeding Lattice personas…
Seeding Mira's client profile + projects…
Seeding inquiry for Kai's inbox…
Seeding audit log entries for Nox's view…
Seeding Studio Mix agent runs…
✓ Seed complete
```

## 6. Verify locally

```powershell
pnpm dev
```

Visit `http://localhost:3400`:
- Gallery loads with 4 scenes (2 live, 2 coming online)
- `/lattice` shows the 4 persona cards
- Click **Mira Voss** → `/lattice/dashboard` loads with 3 real projects, 2 deliverables awaiting review
- Click any other persona → lands on the placeholder page (Phase 2b wires those)

## 7. Trigger the production deploy

The push from this commit auto-deploys via Vercel-GitHub integration. Watch:

```powershell
vercel ls
```

Wait for the latest deploy to show `● Ready`. Then visit:

```
https://gravixar-demo-git-main-gravixar-svs-projects.vercel.app/lattice/dashboard
```

(After picking Mira on `/lattice`.) Should look identical to your local view.

## 8. Sanity-check the cron

```powershell
curl -H "Authorization: Bearer $env:CRON_SECRET" https://gravixar-demo-git-main-gravixar-svs-projects.vercel.app/api/cron/reset-demo
```

Expected JSON response:
```json
{"ok":true,"elapsedMs":...,"ranAt":"...","note":"demo state reset to canonical seed"}
```

If you see `{"error":"unauthorized"}`, the `CRON_SECRET` env var doesn't match what you sent. Set it correctly in Vercel and pull again with `vercel env pull`.

## 9. Domain attach (Phase 3)

Defer until Phase 2b ships and you've confirmed the other 3 personas work. Then:
1. Vercel dashboard → gravixar-demo → Domains → add `demo.gravixar.com`
2. Vercel prints a CNAME record
3. Add it to GoDaddy DNS for `gravixar.com`
4. SSL provisions in ~60 seconds after DNS resolves
5. Update `NEXTAUTH_URL` in Vercel to `https://demo.gravixar.com`, redeploy
