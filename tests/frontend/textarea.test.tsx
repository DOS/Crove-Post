import { describe, expect, it, vi } from 'vitest';

// TranslatedLabel pulls in react-i18next + brand context; the baseline tests
// only care that the label text is rendered, so pin it to the raw label.
vi.mock(
  '../../libraries/react-shared-libraries/src/translation/translated-label',
  () => ({
    TranslatedLabel: ({ label }: { label: string }) => label,
  })
);

import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { Textarea } from '@gitroom/react/form/textarea';

function FormHarness({
  onSubmit,
  children,
}: {
  onSubmit: (values: Record<string, unknown>) => void;
  children: React.ReactNode;
}) {
  const form = useForm({ defaultValues: { bio: '' } });
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

describe('Textarea', () => {
  it('renders the label and the textarea element', () => {
    render(<Textarea label="Biography" name="bio" disableForm />);
    expect(screen.getByText('Biography')).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('registers with react-hook-form and submits typed values', async () => {
    const onSubmit = vi.fn();
    render(
      <FormHarness onSubmit={onSubmit}>
        <Textarea label="Biography" name="bio" />
        <button type="submit">Send</button>
      </FormHarness>
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'hello world' },
    });
    fireEvent.click(screen.getByText('Send'));
    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ bio: 'hello world' });
    });
  });

  it('shows an explicit error message under the field', () => {
    render(
      <Textarea label="Biography" name="bio" error="Required field" disableForm />
    );
    expect(screen.getByText('Required field')).toBeTruthy();
  });

  it('does not register with the form in disableForm mode', () => {
    render(<Textarea label="Biography" name="bio" disableForm />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'free text' } });
    expect(textarea.value).toBe('free text');
  });
});
