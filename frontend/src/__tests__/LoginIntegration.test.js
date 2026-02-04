import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../features/auth/pages/Login';
import authReducer from '../features/auth/authSlice';

// Mock the API client
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

const renderWithProviders = (ui, { initialState = {}, store = createTestStore(initialState) } = {}) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </Provider>
  );
  return render(ui, { wrapper: Wrapper });
};

describe('LoginPage Integration Tests', () => {
  it('switches between login and signup tabs', () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/sign up/i));
    expect(screen.getByPlaceholderText(/your.email@company.com/i)).toBeInTheDocument();
  });

  it('handles user type selection for signup', () => {
    renderWithProviders(<LoginPage />);
    
    fireEvent.click(screen.getByText(/sign up/i));
    
    const recruiterButton = screen.getByText('Recruiter');
    expect(recruiterButton).toBeInTheDocument();
    
    fireEvent.click(recruiterButton);
    expect(recruiterButton.closest('button')).toHaveClass('bg-gradient-to-r');
  });
});
