import authReducer, { login, logout } from '../features/auth/authSlice';

// Mock apiClient
jest.mock('../services/apiClient');

describe('authSlice', () => {
  const initialState = {
    user: null,
    role: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle logout action', () => {
    const loggedInState = {
      user: { id: 1, username: 'testuser' },
      role: 'recruiter',
      isAuthenticated: true,
      loading: false,
      error: null,
    };

    const state = authReducer(loggedInState, logout());
    
    expect(state).toEqual(initialState);
  });

  it('should handle login.fulfilled', () => {
    const payload = {
      user: { id: 1, username: 'testuser', role: 'recruiter' },
      access_token: 'token123'
    };
    
    const state = authReducer(initialState, { type: login.fulfilled.type, payload });
    
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(payload.user);
    expect(state.isAuthenticated).toBe(true);
  });
});
