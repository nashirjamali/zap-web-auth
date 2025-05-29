/**
 * Utility functions for working with Internet Computer
 */

/**
 * Format a principal ID for display
 * @param principalId The principal ID to format
 * @returns The formatted principal ID
 */
export function formatPrincipal(principalId: string | null): string {
  if (!principalId) return 'Not authenticated';
  
  // If the principal is longer than 10 characters, truncate it
  if (principalId.length > 20) {
    return `${principalId.slice(0, 10)}...${principalId.slice(-10)}`;
  }
  
  return principalId;
}

/**
 * Get the Internet Identity URL from environment variables
 * @returns The Internet Identity URL
 */
export function getIIUrl(): string {
  return process.env.NEXT_PUBLIC_II_URL || 'https://identity.ic0.app';
} 