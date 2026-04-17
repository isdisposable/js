<p align="center">
  <img src="https://isdisposable.com/logo.png" width="60" alt="isDisposable" />
</p>

<h1 align="center">@isdisposable/js</h1>

<p align="center">
  <strong>Stop fake signups. One function call.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@isdisposable/js"><img src="https://img.shields.io/npm/v/@isdisposable/js.svg?style=flat-square&color=6366f1" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@isdisposable/js"><img src="https://img.shields.io/npm/dm/@isdisposable/js.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="https://bundlephobia.com/package/@isdisposable/js"><img src="https://img.shields.io/bundlephobia/minzip/@isdisposable/js?style=flat-square&color=22c55e" alt="bundle size" /></a>
  <a href="https://github.com/isdisposable/js/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@isdisposable/js.svg?style=flat-square" alt="license" /></a>
</p>

<p align="center">
  Open-source disposable email detection with <strong>160,000+</strong> domains.<br/>
  Offline-first. Zero dependencies. TypeScript-native.
</p>

<p align="center">
  <a href="https://isdisposable.com">Website</a> · <a href="https://isdisposable.com/docs">Docs</a> · <a href="https://isdisposable.com/docs/api-reference">API Reference</a> · <a href="https://isdisposable.com/pricing">Pricing</a>
</p>

---

## Install

```bash
npm install @isdisposable/js
```

```bash
pnpm add @isdisposable/js
```

```bash
yarn add @isdisposable/js
```

## Usage

```ts
import { isDisposable } from '@isdisposable/js';

isDisposable('test@mailinator.com'); // true
isDisposable('user@gmail.com');      // false
```

Synchronous. Offline. Zero config. That's it.

## Bulk Check

```ts
import { isDisposableBulk } from '@isdisposable/js';

const results = isDisposableBulk([
  'a@tempmail.com',
  'b@gmail.com',
  'c@guerrillamail.com',
]);
// [true, false, true]
```

## Domain Check

```ts
import { isDomainDisposable } from '@isdisposable/js';

isDomainDisposable('mailinator.com'); // true
isDomainDisposable('gmail.com');      // false
```

## API Mode — Real-time Detection

For DNS/MX validation, risk scoring, and domain age analysis:

```ts
import { createIsDisposable } from '@isdisposable/js';

const client = createIsDisposable({
  apiKey: 'isd_live_xxxxx', // Get one at https://isdisposable.com
});

const result = await client.check('test@suspicious-domain.com');
// {
//   disposable: true,
//   score: 95,          ← risk score (0-100)
//   reason: "blocklist_match",
//   mx_valid: true,
//   domain_age_days: 3,
//   cached: false
// }
```

The API adds signals that offline detection can't: MX record validation, self-referencing mail server detection, domain age via RDAP, and username entropy scoring. If the API is unreachable, it automatically falls back to offline detection — your app never breaks.

<details>
<summary><strong>API Client Options</strong></summary>

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | — | API key from [isdisposable.com](https://isdisposable.com) |
| `apiUrl` | `string` | `https://isdisposable.com` | API base URL |
| `timeout` | `number` | `5000` | Request timeout (ms) |
| `cache` | `boolean` | `true` | Cache API responses |
| `cacheTTL` | `number` | `3600` | Cache duration (seconds) |

</details>

<details>
<summary><strong>Bulk API Check</strong></summary>

```ts
const results = await client.checkBulk([
  'a@tempmail.com',
  'b@gmail.com',
]);
```

</details>

## Framework Integrations

<details>
<summary><strong>Next.js — Server Action</strong></summary>

```ts
'use server';
import { isDisposable } from '@isdisposable/js';

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;

  if (isDisposable(email)) {
    return { error: 'Please use a real email address' };
  }

  // Continue with signup...
}
```
</details>

<details>
<summary><strong>Express — Middleware</strong></summary>

```ts
import express from 'express';
import { isDisposable } from '@isdisposable/js';

const app = express();
app.use(express.json());

app.post('/signup', (req, res, next) => {
  if (isDisposable(req.body.email)) {
    return res.status(400).json({ error: 'Disposable emails not allowed' });
  }
  next();
});
```
</details>

<details>
<summary><strong>Better Auth</strong></summary>

```ts
import { betterAuth } from 'better-auth';
import { isDisposable } from '@isdisposable/js';

export const auth = betterAuth({
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (isDisposable(user.email)) {
            return false; // Block signup
          }
          return user;
        },
      },
    },
  },
});
```
</details>

<details>
<summary><strong>Supabase Edge Function</strong></summary>

```ts
import { isDisposable } from '@isdisposable/js';

Deno.serve(async (req) => {
  const { email } = await req.json();

  if (isDisposable(email)) {
    return new Response(
      JSON.stringify({ error: 'Disposable emails not allowed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ ok: true }));
});
```
</details>

<details>
<summary><strong>NestJS — Guard</strong></summary>

```ts
import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { isDisposable } from '@isdisposable/js';

@Injectable()
export class DisposableEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (isDisposable(request.body?.email)) {
      throw new BadRequestException('Disposable emails not allowed');
    }
    return true;
  }
}
```
</details>

<details>
<summary><strong>Fastify — Hook</strong></summary>

```ts
import Fastify from 'fastify';
import { isDisposable } from '@isdisposable/js';

const app = Fastify();

app.addHook('preHandler', async (request, reply) => {
  const email = (request.body as any)?.email;
  if (email && isDisposable(email)) {
    return reply.status(400).send({ error: 'Disposable emails not allowed' });
  }
});
```
</details>

## How It Works

```
Email input
    │
    ▼
┌──────────────┐     ┌─────────────────────┐
│  Blocklist   │────▶│  160k+ domains      │
│  (offline)   │     │  O(1) Set lookup     │
└──────┬───────┘     │  < 1ms              │
       │ not found   └─────────────────────┘
       ▼
┌──────────────┐     ┌─────────────────────┐
│  API Mode    │────▶│  DNS/MX validation  │
│  (optional)  │     │  Domain age (RDAP)  │
└──────────────┘     │  Username entropy   │
                     │  Risk score 0-100   │
                     └─────────────────────┘
```

**Offline mode** checks against a bundled blocklist of 160,000+ domains. Instant, synchronous, zero network calls.

**API mode** adds real-time signals: MX record validation, self-referencing mail server detection, domain age analysis, suspicious MX infrastructure matching, and username entropy scoring.

## Comparison

| | isDisposable | mailchecker | disposable-email-domains |
|---|:---:|:---:|:---:|
| **Domains** | **160,000+** | 55,000 | 5,000 |
| **Boolean API** | ✅ | ✅ | ❌ (raw list) |
| **Zero deps** | ✅ | ❌ | N/A |
| **TypeScript** | ✅ | Partial | N/A |
| **Hosted API** | ✅ | ❌ | ❌ |
| **Risk scoring** | ✅ | ❌ | ❌ |
| **DNS/MX checks** | ✅ | ❌ | ❌ |
| **Maintained** | ✅ | Sporadic | Sporadic |

## SDKs

| Language | Package | Status |
|----------|---------|--------|
| JavaScript/TypeScript | [`@isdisposable/js`](https://www.npmjs.com/package/@isdisposable/js) | ✅ Stable |
| Python | `isdisposable` | 🔜 Coming soon |
| Go | `isdisposable-go` | 🔜 Coming soon |

## API Reference

### `isDisposable(email: string): boolean`
Synchronous. Returns `true` if the email is from a disposable provider.

### `isDisposableBulk(emails: string[]): boolean[]`
Synchronous. Returns array of booleans matching input order.

### `isDomainDisposable(domain: string): boolean`
Check a domain directly without an email address.

### `extractDomain(email: string): string | null`
Extract and validate the domain from an email address.

### `createIsDisposable(config): ApiClient`
Create an API client with `.check(email)`, `.checkBulk(emails)`, and `.clearCache()`.

## Score Calculation (API Mode)

| Signal | Score Impact |
|--------|:-----------:|
| Domain in blocklist (160k+) | **+95** |
| Self-referencing MX server | **+50** |
| MX points to known disposable infra | **= 90** |
| Suspicious MX IP match | **+45** |
| No valid MX records | **+40** |
| Domain registered < 7 days | **+30** |
| MX pattern match | **+20** |
| Domain registered < 30 days | **+15** |
| Username entropy (bot-generated) | **+15** |
| Plus-addressing detected | **+10** |
| Valid MX + old domain + clean | **= 5** |

Score ≥ 50 = disposable. Capped at 100.

## Contributing

Found a domain that should be blocked? [Open an issue](https://github.com/isdisposable/js/issues/new) with the domain name. We review and update the blocklist regularly.

## License

MIT — use it in any project, commercial or open-source.

---

<p align="center">
  Built by <a href="https://github.com/junaiddshaukat">Junaid Shaukat</a><br/>
  Dashboard & API at <a href="https://isdisposable.com">isdisposable.com</a><br/>
  <br/>
  <a href="https://www.producthunt.com/products/isdisposable?utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-isdisposable" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1110404&theme=dark&t=1774787251171" alt="isDisposable on Product Hunt" width="200" /></a>
</p>
