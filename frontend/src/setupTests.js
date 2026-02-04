import '@testing-library/jest-dom';

// Polyfill for TextEncoder
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  Editor: ({ value, onChange }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="monaco-editor"
    />
  ),
}));

// Mock ProfileManagement to avoid import.meta issues
jest.mock('./components/common/ProfileManagement', () => {
  return function MockProfileManagement() {
    return <div data-testid="profile-management">Profile Management</div>;
  };
});

// Mock import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://127.0.0.1:8000'
      }
    }
  },
  writable: true
});
