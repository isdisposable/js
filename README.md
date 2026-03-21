# @isdisposable/js

[![npm version](https://img.shields.io/npm/v/@isdisposable/js.svg)](https://www.npmjs.com/package/@isdisposable/js)
[![npm downloads](https://img.shields.io/npm/dm/@isdisposable/js.svg)](https://www.npmjs.com/package/@isdisposable/js)
[![license](https://img.shields.io/npm/l/@isdisposable/js.svg)](https://github.com/isdisposable/js/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@isdisposable/js)](https://bundlephobia.com/package/@isdisposable/js)

**Stop fake signups. One line of code.**

Open-source email validation that catches disposable emails before they waste your time. 161,000+ domains. Zero dependencies.

## Install

```bash
npm install @isdisposable/js
```

## Quick Start

```ts
import { isDisposable } from '@isdisposable/js';

isDisposable('test@mailinator.com'); // true
isDisposable('user@gmail.com');      // false
```

That's it. Synchronous, offline, zero config.

## Bulk Check

```ts
import { isDisposableBulk } from '@isdisposable/js';

isDisposableBulk(['a@tempmail.com', 'b@gmail.com']);
// [true, false]
```

## Why isDisposable?

| Feature | isDisposable | mailchecker | disposable-email-domains |
|---------|-------------|-------------|--------------------------|
| Domains | 161,000+ | 55,000 | 5,000 |
| Simple boolean API | Yes | Yes | No (just a list) |
| Zero dependencies | Yes | No | N/A |
| TypeScript | Yes | Partial | N/A |
| Hosted API with scoring | Yes | No | No |
| Actively maintained | Yes | Sporadic | Sporadic |

## Framework Examples

### Next.js Server Action

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

### Express Middleware

```ts
import express from 'express';
import { isDisposable } from '@isdisposable/js';

const app = express();
app.use(express.json());

app.post('/signup', (req, res, next) => {
  if (isDisposable(req.body.email)) {
    return res.status(400).json({ error: 'Please use a real email address' });
  }
  next();
});
```

### Better Auth Integration

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

### Supabase Edge Function

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

## API Mode (Enhanced Detection)

For real-time DNS/MX checks, risk scoring (0-100), and domain age analysis, use the hosted API:

```ts
import { createIsDisposable } from '@isdisposable/js';

const checker = createIsDisposable({
  apiKey: 'isd_live_xxxxx', // Get one at https://isdisposable.com
});

const result = await checker.check('test@mailinator.com');
// {
//   disposable: true,
//   email: "test@mailinator.com",
//   domain: "mailinator.com",
//   score: 95,
//   reason: "blocklist_match",
//   mx_valid: true,
//   domain_age_days: 4380,
//   cached: false
// }

// Bulk check (up to 100 emails)
const results = await checker.checkBulk([
  'a@tempmail.com',
  'b@gmail.com',
]);
```

The API client automatically falls back to offline detection if the API is unreachable.

## How It Works

1. **Offline mode (default):** Checks against a bundled blocklist of 161,000+ known disposable email domains. Instant, synchronous, zero network calls.

2. **API mode (optional):** Adds real-time DNS/MX record validation, domain age checks via RDAP, and a composite risk score from 0-100. Requires an API key from [isdisposable.com](https://isdisposable.com).

## API

### `isDisposable(email: string): boolean`

Synchronous check. Returns `true` if the email domain is disposable.

### `isDisposableBulk(emails: string[]): boolean[]`

Synchronous bulk check. Returns array of booleans.

### `isDomainDisposable(domain: string): boolean`

Check a domain directly (without an email address).

### `createIsDisposable(config): ApiClient`

Create an API client for enhanced detection.

**Config options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | — | Your API key from isdisposable.com |
| `apiUrl` | `string` | `https://api.isdisposable.com` | API base URL |
| `timeout` | `number` | `5000` | Request timeout in ms |
| `cache` | `boolean` | `true` | Enable response caching |
| `cacheTTL` | `number` | `3600` | Cache TTL in seconds |

## Contributing

Found a domain that should be blocked? Open an issue or PR on the [GitHub repo](https://github.com/isdisposable/js) with the domain name. We review and update the blocklist regularly.

## License

MIT

---

Built by [Junaid Shaukat](https://github.com/junaiddshaukat). Dashboard and API at [isdisposable.com](https://isdisposable.com).

Part of the [isDisposable](https://github.com/isdisposable) ecosystem. feedback and contact here --> junaidshaukat546@gmail.com
