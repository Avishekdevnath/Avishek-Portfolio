import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { isValidObjectId } from 'mongoose';

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
    console.error('Error fetching project by ID:', error);
    return null;
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
    }).lean({ virtuals: true });
    
    return project;
  } catch (error) {
    console.error('Error fetching published project by ID:', error);
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
    .lean();
    
    return projects.map(project => project._id);
  } catch (error) {
    console.error('Error fetching project IDs:', error);
    return [];
  }
}

/**
 * Get published projects with optional filtering
 * @param options - Query options
 * @returns Array of published projects
 */
export async function getPublishedProjects(options: {
  category?: string;
  featured?: boolean;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  try {
    await connectDB();
    
    const {
      category,
      featured,
      limit = 10,
      sortBy = 'order',
      sortOrder = 'asc'
    } = options;

    // Build query
    const query: any = { status: 'published' };
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured;

    // Build sort config
    const sortConfig: any = { [sortBy]: sortOrder };
    if (sortBy !== 'order') {
      sortConfig.order = 'asc';
    }

    const projects = await Project.find(query)
      .sort(sortConfig)
      .limit(limit)
      .lean({ virtuals: true });
    
    return projects;
  } catch (error) {
    console.error('Error fetching published projects:', error);
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
    
    return projects;
  } catch (error) {
    console.error('Error fetching related projects:', error);
    return [];
  }
}
