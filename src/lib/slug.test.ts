import assert from 'node:assert/strict';
import test from 'node:test';

import { buildNextSlugHistory, normalizeSlug, resolveAutoSlug } from './slug';

test('normalizeSlug lowercases and hyphenates titles', () => {
  assert.equal(normalizeSlug('  My Great Project!  '), 'my-great-project');
});

test('resolveAutoSlug suffixes duplicates', async () => {
  const existing = new Set(['my-great-project']);

  const slug = await resolveAutoSlug('My Great Project', async (value) => existing.has(value));

  assert.equal(slug, 'my-great-project-1');
});

test('buildNextSlugHistory stores previous canonical slug once', () => {
  assert.deepEqual(
    buildNextSlugHistory('current-slug', 'next-slug', ['older-slug', 'current-slug']),
    ['older-slug', 'current-slug']
  );
});
