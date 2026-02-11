/**
 * Base Service Interface
 *
 * Common interface that all services should extend.
 * Provides standard patterns for service implementation.
 *
 * @module services/interfaces/base-service.interface
 */

/**
 * Base service interface with common patterns
 */
export interface IBaseService {
  /**
   * Service name for logging and debugging
   */
  readonly serviceName: string;
}

/**
 * Standard CRUD operations interface
 */
export interface ICrudService<
  TEntity,
  TCreateInput,
  TUpdateInput,
> extends IBaseService {
  /**
   * Create a new entity
   */
  create(input: TCreateInput): Promise<TEntity>;

  /**
   * Get entity by ID
   */
  getById(id: string, userId: string): Promise<TEntity | null>;

  /**
   * Get all entities for a user
   */
  getByUser(userId: string): Promise<TEntity[]>;

  /**
   * Update an entity
   */
  update(id: string, userId: string, data: TUpdateInput): Promise<TEntity>;

  /**
   * Delete an entity
   */
  delete(id: string, userId: string): Promise<void>;
}

/**
 * Paginated list response
 */
export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Pagination options
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
