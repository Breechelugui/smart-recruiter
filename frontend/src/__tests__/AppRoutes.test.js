import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import authReducer from '../features/auth/authSlice';
import assessmentsReducer from '../features/assessments/assessmentSlice';
import invitationsReducer from '../features/invitations/invitationsSlice';
import submissionsReducer from '../features/submissions/submissionsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

// Mock apiClient
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

describe('AppRoutes', () => {
  it('redirects to login when not authenticated', () => {
    renderWithProviders(<AppRoutes />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows recruiter dashboard when authenticated as recruiter', () => {
    const initialState = {
      auth: {
        user: { id: 1, username: 'recruiter', role: 'recruiter' },
        role: 'recruiter',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };
    
    renderWithProviders(<AppRoutes />, { initialState, initialEntries: ['/recruiter'] });
    
    expect(screen.getByText('Recruiter Dashboard')).toBeInTheDocument();
  });
});
