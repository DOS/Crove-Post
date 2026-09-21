import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@gitroom/react/form/button';

describe('Button', () => {
  it('renders children and defaults to type="button"', () => {
    render(<Button>Hello</Button>);
    const button = screen.getByRole('button', { name: 'Hello' });
    expect(button).toBeTruthy();
    expect(button.getAttribute('type')).toBe('button');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects an explicit type override', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit');
  });

  it('marks itself disabled and non-interactive while loading', () => {
    render(<Button loading>Posting</Button>);
    const button = screen.getByRole('button');
    // loading forces the same visual treatment as disabled
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('pointer-events-none');
  });

  it('hides the label content while loading', () => {
    const { container } = render(<Button loading>Loading</Button>);
    const inner = container.querySelector('.invisible');
    expect(inner).toBeTruthy();
  });

  it('applies the secondary style', () => {
    render(<Button secondary>Cancel</Button>);
    expect(screen.getByRole('button').className).toContain('bg-third');
  });

  it('applies the primary style by default', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button').className).toContain('bg-forth');
  });
});
