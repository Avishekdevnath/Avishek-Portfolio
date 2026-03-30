import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('RootLayout suppresses hydration warnings on body for extension-injected attributes', () => {
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  const source = fs.readFileSync(layoutPath, 'utf8');

  assert.match(
    source,
    /<body[^>]*suppressHydrationWarning/,
    'RootLayout body must suppress hydration warnings because browser extensions inject body attributes before React hydrates'
  );
});
