import { FilterQuery, SortOrder } from 'mongoose';

export interface BaseQuery<T> extends FilterQuery<T> {
  status?: 'draft' | 'published';
  featured?: boolean;
  type?: string;
  category?: string;
  userId?: string;
}

export interface SortConfig {
  [key: string]: SortOrder;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<{
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}> {} 