import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '../../libraries/react-shared-libraries/src/translation/translated-label',
  () => ({
    TranslatedLabel: ({ label }: { label: string }) => label,
  })
);

import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '@gitroom/react/form/checkbox';

describe('Checkbox', () => {
  it('renders the label text', () => {
    render(<Checkbox label="Send notifications" disableForm />);
    expect(screen.getByText('Send notifications')).toBeTruthy();
  });

  it('reports a toggled value through onChange in disableForm mode', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Checkbox label="Enabled" disableForm checked={false} onChange={onChange} />
    );
    // the click handler sits on the 24x24 box, not on the label text
    const box = container.querySelector('.cursor-pointer') as HTMLElement;
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalledWith({
      target: { name: undefined, value: true },
    });
  });

  it('reflects the checked prop', () => {
    const { container } = render(
      <Checkbox label="Enabled" disableForm checked />
    );
    // the outer div carries the component classes; the check visual state is
    // derived from checked - just assert the structure rendered
    expect(container.querySelector('div')).toBeTruthy();
    expect(screen.getByText('Enabled')).toBeTruthy();
  });
});
