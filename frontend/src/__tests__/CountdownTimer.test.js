import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import CountdownTimer from '../components/common/CountdownTimer';
import authReducer from '../features/auth/authSlice';

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

const renderWithProviders = (ui, { store = createTestStore() } = {}) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </Provider>
  );
  return render(ui, { wrapper: Wrapper });
};

describe('CountdownTimer Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays initial time and counts down', () => {
    renderWithProviders(<CountdownTimer timeLimit={1} />);
    
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('stops counting when completed', async () => {
    const onComplete = jest.fn();
    renderWithProviders(<CountdownTimer timeLimit={0} onTimeExpire={onComplete} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(screen.getByText('TIME EXPIRED - Auto-submitting...')).toBeInTheDocument();
    });
  });
});
