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

test('backfill keeps existing blog slugs and only generates missing ones', () => {
  function needsSlug(record: { slug?: string | null }): boolean {
    return !record.slug;
  }

  function inferSlugMode(record: { title: string; slug: string }): 'auto' | 'manual' {
    return normalizeSlug(record.title) === record.slug ? 'auto' : 'manual';
  }

  assert.equal(needsSlug({ slug: 'my-project' }), false);
  assert.equal(needsSlug({ slug: null }), true);
  assert.equal(needsSlug({}), true);
  assert.equal(inferSlugMode({ title: 'My Project', slug: 'my-project' }), 'auto');
  assert.equal(inferSlugMode({ title: 'My Project', slug: 'custom-slug' }), 'manual');
});
