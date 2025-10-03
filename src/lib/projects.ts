import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { isValidObjectId } from 'mongoose';

// Type definitions for better type safety
export interface ProjectQueryOptions {
  category?: string;
  featured?: boolean;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface ProjectStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  categories: Record<string, number>;
}

/**
 * Get a single project by ID
 * @param id - Project ID
 * @returns Project data or null if not found
 */
export async function getProjectById(id: string) {
  try {
    // Validate ID format
    if (!isValidObjectId(id)) {
      return null;
    }

    await connectDB();
    
    const project = await Project.findById(id).lean({ virtuals: true });
    return project;
  } catch (error) {
    // Error fetching project by ID
    return null;
  }
}

/**
 * Get aggregate stats for projects
 */
export async function getProjectStats(): Promise<ProjectStats> {
  try {
    await connectDB();

    const [total, published, draft, featured] = await Promise.all([
      Project.countDocuments({}),
      Project.countDocuments({ status: 'published' }),
      Project.countDocuments({ status: 'draft' }),
      Project.countDocuments({ featured: true })
    ]);

    const categoriesAgg = await Project.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categories: Record<string, number> = {};
    for (const row of categoriesAgg) {
      categories[row._id] = row.count;
    }

    return { total, published, draft, featured, categories };
  } catch (error) {
    // Error fetching project stats
    return { total: 0, published: 0, draft: 0, featured: 0, categories: {} };
  }
}

/**
 * Get a published project by ID (for public pages)
 * @param id - Project ID
 * @returns Published project data or null if not found/not published
 */
export async function getPublishedProjectById(id: string) {
  try {
    // Validate ID format
    if (!isValidObjectId(id)) {
      return null;
    }

    await connectDB();
    
    const project = await Project.findOne({ 
      _id: id, 
      status: 'published' 
    })
    .lean({ virtuals: true })
    .maxTimeMS(10000); // 10 second timeout for individual queries
    
    return project as any; // Type assertion to fix TypeScript issues
  } catch (error) {
    // Error fetching published project by ID
    return null;
  }
}

/**
 * Get list of project IDs for static generation
 * @param limit - Maximum number of IDs to return
 * @returns Array of project IDs
 */
export async function listProjectIds(limit = 100) {
  try {
    await connectDB();
    
    const projects = await Project.find(
      { status: 'published' },
      { projection: { _id: 1 } }
    )
    .limit(limit)
    .lean()
    .maxTimeMS(5000); // 5 second timeout for ID listing
    
    return projects.map(project => project._id);
  } catch (error) {
    // Error fetching project IDs
    return [];
  }
}

/**
 * Get published projects with optional filtering
 * @param options - Query options
 * @returns Array of published projects
 */
export async function getPublishedProjects(options: ProjectQueryOptions = {}) {
  try {
    await connectDB();
    
    const {
      category,
      featured,
      limit = 10,
      sortBy = 'order',
      sortOrder = 'asc',
      search
    } = options;

    // Build query
    const query: any = { status: 'published' };
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured;
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort config
    const sortConfig: any = { [sortBy]: sortOrder };
    if (sortBy !== 'order') {
      sortConfig.order = 'asc';
    }

    const projects = await Project.find(query)
      .sort(sortConfig)
      .limit(limit)
      .lean({ virtuals: true });
    
    return projects as any[]; // Type assertion to fix TypeScript issues
  } catch (error) {
    // Error fetching published projects
    return [];
  }
}

/**
 * Get related projects by category
 * @param category - Project category
 * @param excludeId - Project ID to exclude
 * @param limit - Maximum number of related projects
 * @returns Array of related projects
 */
export async function getRelatedProjects(
  category: string, 
  excludeId: string, 
  limit = 3
) {
  try {
    await connectDB();
    
    const projects = await Project.find({
      status: 'published',
      category,
      _id: { $ne: excludeId }
    })
    .sort({ order: 'asc' })
    .limit(limit)
    .lean({ virtuals: true });
    
    return projects as any[]; // Type assertion to fix TypeScript issues
  } catch (error) {
    // Error fetching related projects
    return [];
  }
}
