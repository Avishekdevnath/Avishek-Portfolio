import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyManualSlugEdit,
  applyTitleToSlugDraft,
  createSlugDraft,
  regenerateSlugDraft,
} from './slug-editor';

test('title changes update the slug while draft is auto', () => {
  const draft = createSlugDraft('First Title');
  const next = applyTitleToSlugDraft(draft, 'Second Title');

  assert.equal(next.slug, 'second-title');
  assert.equal(next.slugMode, 'auto');
});

test('manual edits lock the slug', () => {
  const draft = applyManualSlugEdit(createSlugDraft('First Title'), 'custom-url');
  const next = applyTitleToSlugDraft(draft, 'Second Title');

  assert.equal(next.slug, 'custom-url');
  assert.equal(next.slugMode, 'manual');
});

test('regenerateSlugDraft returns the draft to auto mode', () => {
  const draft = applyManualSlugEdit(createSlugDraft('First Title'), 'custom-url');
  const next = regenerateSlugDraft(draft, 'Second Title');

  assert.equal(next.slug, 'second-title');
  assert.equal(next.slugMode, 'auto');
});

test('regenerate resets a manual slug back to the title-derived slug', () => {
  const draft = applyManualSlugEdit(createSlugDraft('My Post'), 'hand-written');
  const reset = regenerateSlugDraft(draft);

  assert.equal(reset.slug, 'my-post');
  assert.equal(reset.slugMode, 'auto');
});

test('manual slug input is normalized before submission', () => {
  const draft = applyManualSlugEdit(createSlugDraft('My Post'), '  Hello World!!  ');
  assert.equal(draft.slug, 'hello-world');
  assert.equal(draft.slugMode, 'manual');
});
