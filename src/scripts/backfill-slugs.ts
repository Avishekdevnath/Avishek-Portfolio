/**
 * Backfill slug fields for blogs and projects.
 *
 * Usage:
 *   tsx src/scripts/backfill-slugs.ts           # dry run (logs only)
 *   tsx src/scripts/backfill-slugs.ts --write    # persists changes to DB
 */

// Load environment variables from .env.local or .env
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(filename: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), filename), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file not found — ok
  }
}

loadEnv('.env.local');
loadEnv('.env');

import mongoose from 'mongoose';
import { normalizeSlug } from '../lib/slug';

const DRY_RUN = !process.argv.includes('--write');

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri);
}

function inferSlugMode(title: string, slug: string): 'auto' | 'manual' {
  return normalizeSlug(title) === slug ? 'auto' : 'manual';
}

async function backfillBlogs() {
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  const blogs = await Blog.find({}).lean() as any[];

  let updated = 0;
  const usedSlugs = new Set<string>(blogs.filter((b: any) => b.slug).map((b: any) => b.slug as string));

  for (const blog of blogs) {
    const changes: Record<string, any> = {};

    if (!blog.slug) {
      let baseSlug = normalizeSlug(blog.title || 'blog');
      let candidate = baseSlug;
      let counter = 0;
      while (usedSlugs.has(candidate)) {
        counter++;
        candidate = `${baseSlug}-${counter}`;
      }
      usedSlugs.add(candidate);
      changes.slug = candidate;
      changes.slugMode = 'auto';
    }

    if (!blog.slugHistory) {
      changes.slugHistory = [];
    }

    if (!blog.slugMode && blog.slug) {
      changes.slugMode = inferSlugMode(blog.title || '', blog.slug);
    }

    if (Object.keys(changes).length > 0) {
      updated++;
      if (DRY_RUN) {
        console.log(`[blog] ${blog._id} → ${JSON.stringify(changes)}`);
      } else {
        await Blog.updateOne({ _id: blog._id }, { $set: changes });
      }
    }
  }

  console.log(`Blogs: ${updated} need updates (${DRY_RUN ? 'DRY RUN' : 'written'})`);
}

async function backfillProjects() {
  const Project = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
  const projects = await Project.find({}).lean() as any[];

  let updated = 0;
  const usedSlugs = new Set<string>(projects.filter((p: any) => p.slug).map((p: any) => p.slug as string));

  for (const project of projects) {
    const changes: Record<string, any> = {};

    if (!project.slug) {
      let baseSlug = normalizeSlug(project.title || 'project');
      let candidate = baseSlug;
      let counter = 0;
      while (usedSlugs.has(candidate)) {
        counter++;
        candidate = `${baseSlug}-${counter}`;
      }
      usedSlugs.add(candidate);
      changes.slug = candidate;
      changes.slugMode = 'auto';
    }

    if (!project.slugHistory) {
      changes.slugHistory = [];
    }

    if (!project.slugMode && project.slug) {
      changes.slugMode = inferSlugMode(project.title || '', project.slug);
    }

    if (Object.keys(changes).length > 0) {
      updated++;
      if (DRY_RUN) {
        console.log(`[project] ${project._id} → ${JSON.stringify(changes)}`);
      } else {
        await Project.updateOne({ _id: project._id }, { $set: changes });
      }
    }
  }

  console.log(`Projects: ${updated} need updates (${DRY_RUN ? 'DRY RUN' : 'written'})`);
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (pass --write to persist)' : 'WRITE'}`);
  await connect();
  await backfillBlogs();
  await backfillProjects();
  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
