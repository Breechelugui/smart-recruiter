import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useAuth from '../hooks/useAuth';
import authReducer from '../features/auth/authSlice';

// Mock apiClient
jest.mock('../services/apiClient');

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        role: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

const wrapper = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useAuth Hook', () => {
  it('returns initial auth state', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { 
      wrapper: ({ children }) => wrapper({ children, store })
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns authenticated user state', () => {
    const store = createTestStore({
      auth: {
        user: { id: 1, username: 'testuser', role: 'recruiter' },
        role: 'recruiter',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    });
    
    const { result } = renderHook(() => useAuth(), { 
      wrapper: ({ children }) => wrapper({ children, store })
    });
    
    expect(result.current.user).toEqual({ id: 1, username: 'testuser', role: 'recruiter' });
    expect(result.current.isAuthenticated).toBe(true);
  });
});
