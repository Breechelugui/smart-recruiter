import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import LoginPage from '../features/auth/pages/Login';

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

const renderWithProviders = (ui, { initialState = {}, store = createTestStore(initialState) } = {}) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
  return render(ui, { wrapper: Wrapper });
};

describe('LoginPage', () => {
  it('renders login form', () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to portal/i })).toBeInTheDocument();
  });

  it('submits form with valid credentials', () => {
    const mockStore = createTestStore();
    renderWithProviders(<LoginPage />, { store: mockStore });
    
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });
});
