/**
 * Sample Hook Test
 * Demonstrates testing patterns for custom React hooks
 */

import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

// Mock the auth store
jest.mock('@/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

describe('useAuth Hook', () => {
  it('returns auth state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('provides login and logout functions', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});
