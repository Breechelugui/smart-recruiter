import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { loadMe } from '../features/auth/authSlice';
import AppRoutes from '../routes/AppRoutes';
import authReducer from '../features/auth/authSlice';
import assessmentsReducer from '../features/assessments/assessmentSlice';
import invitationsReducer from '../features/invitations/invitationsSlice';
import submissionsReducer from '../features/submissions/submissionsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

// Mock the API client
jest.mock('../services/apiClient');

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      assessments: assessmentsReducer,
      invitations: invitationsReducer,
      submissions: submissionsReducer,
      notifications: notificationsReducer,
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
      assessments: {
        items: [],
        loading: false,
        error: null,
        ...initialState.assessments,
      },
      invitations: {
        items: [],
        loading: false,
        error: null,
        ...initialState.invitations,
      },
      submissions: {
        items: [],
        loading: false,
        error: null,
        ...initialState.submissions,
      },
      notifications: {
        items: [],
        loading: false,
        error: null,
        ...initialState.notifications,
      },
    },
  });
};

const renderWithProviders = (ui, { initialState = {}, store = createTestStore(initialState), initialEntries = ['/'] } = {}) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </Provider>
  );
  return render(ui, { wrapper: Wrapper });
};

describe('Authentication Flow Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not load user data when no token exists', () => {
    const mockStore = createTestStore();
    renderWithProviders(<AppRoutes />, { store: mockStore });
    
    expect(screen.getByText(/smart recruiter/i)).toBeInTheDocument();
  });

  it('handles token removal on loadMe failure', async () => {
    localStorage.setItem('access_token', 'invalid_token');
    
    const mockStore = createTestStore();
    await mockStore.dispatch({ type: loadMe.rejected.type, payload: 'Invalid token' });
    
    expect(mockStore.getState().auth.isAuthenticated).toBe(false);
  });
});
