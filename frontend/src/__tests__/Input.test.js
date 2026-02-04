import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../components/common/Input';

describe('Input Component', () => {
  it('renders with basic props', () => {
    render(<Input label="Username" name="username" />);
    
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input label="Email" name="email" onChange={handleChange} />);
    
    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'test@example.com'
      })
    }));
  });
});
