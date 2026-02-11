/**
 * Auth Service Interface
 *
 * Defines the contract for authentication operations.
 * Handles registration, login, OAuth, and session management.
 *
 * @module services/interfaces/auth-service.interface
 */

import type { AuthProvider, User } from '@prisma/client';

import type { IBaseService } from './base-service.interface';

/**
 * Input for user registration
 */
export interface IRegisterInput {
  email: string;
  password: string;
  name: string;
}

/**
 * Input for user login
 */
export interface ILoginInput {
  email: string;
  password: string;
}

/**
 * Input for OAuth authentication
 */
export interface IOAuthInput {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Authentication result
 */
export interface IAuthResult {
  user: Omit<User, 'passwordHash'>;
  token?: string;
  expiresIn?: number;
}

/**
 * Session information
 */
export interface ISession {
  userId: string;
  email: string;
  name: string;
  expiresAt: Date;
}

/**
 * Auth Service Interface
 */
export interface IAuthService extends IBaseService {
  /**
   * Register a new user with email/password
   */
  register(input: IRegisterInput): Promise<IAuthResult>;

  /**
   * Login user with email/password
   */
  login(input: ILoginInput): Promise<IAuthResult>;

  /**
   * Handle OAuth login (Google, Apple)
   */
  handleOAuthLogin(input: IOAuthInput): Promise<IAuthResult>;

  /**
   * Verify user email
   */
  verifyEmail(userId: string, verificationCode: string): Promise<boolean>;

  /**
   * Send password reset email
   */
  requestPasswordReset(email: string): Promise<void>;

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  /**
   * Change password (authenticated user)
   */
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean>;

  /**
   * Validate session token
   */
  validateSession(token: string): Promise<ISession | null>;

  /**
   * Logout (invalidate session)
   */
  logout(userId: string): Promise<void>;

  /**
   * Check if email is already registered
   */
  isEmailRegistered(email: string): Promise<boolean>;
}
