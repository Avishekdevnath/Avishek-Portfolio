import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCanonicalBlogSlug } from './blogs';

test('resolveCanonicalBlogSlug returns match for current slug', async () => {
  const result = await resolveCanonicalBlogSlug('current-title', {
    findBySlug: async (slug) => slug === 'current-title' ? { slug: 'current-title', slugHistory: [] } : null,
    findByHistory: async () => null,
  });

  assert.equal(result.kind, 'match');
  assert.equal(result.slug, 'current-title');
});

test('resolveCanonicalBlogSlug returns redirect metadata for old slugs', async () => {
  const result = await resolveCanonicalBlogSlug('old-title', {
    findBySlug: async (slug) => slug === 'current-title' ? { slug: 'current-title', slugHistory: [] } : null,
    findByHistory: async (slug) => slug === 'old-title' ? { slug: 'current-title', slugHistory: ['old-title'] } : null,
  });

  assert.equal(result.kind, 'redirect');
  assert.equal(result.slug, 'current-title');
});

test('resolveCanonicalBlogSlug returns missing for unknown slug', async () => {
  const result = await resolveCanonicalBlogSlug('unknown', {
    findBySlug: async () => null,
    findByHistory: async () => null,
  });

  assert.equal(result.kind, 'missing');
});

test('manual duplicate blog slug throws a validation error', async () => {
  const { assertManualSlugAvailable } = await import('./slug');

  await assert.rejects(
    () => assertManualSlugAvailable('existing-slug', async () => true, 'different-slug'),
    /Slug already exists/
  );
});

test('auto slug changes append the previous slug to history', async () => {
  const { buildNextSlugHistory } = await import('./slug');

  const history = buildNextSlugHistory('old-slug', 'new-slug', []);
  assert.deepEqual(history, ['old-slug']);
});

test('buildNextSlugHistory deduplicates existing history entries', async () => {
  const { buildNextSlugHistory } = await import('./slug');

  const history = buildNextSlugHistory('current-slug', 'new-slug', ['older-slug', 'current-slug']);
  assert.deepEqual(history, ['older-slug', 'current-slug']);
});

test('resolveAutoSlug generates unique slug by suffixing counter', async () => {
  const { resolveAutoSlug } = await import('./slug');
  const taken = new Set(['my-blog', 'my-blog-1']);
  const slug = await resolveAutoSlug('My Blog', async (s) => taken.has(s));
  assert.equal(slug, 'my-blog-2');
});
