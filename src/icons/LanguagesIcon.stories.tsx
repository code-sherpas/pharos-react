import type { Meta, StoryObj } from '@storybook/react-vite';
import { LanguagesIcon } from './LanguagesIcon';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';

const meta: Meta<typeof LanguagesIcon> = {
  title: 'Icons/LanguagesIcon',
  component: LanguagesIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description:
        'Accessible name for an icon that stands alone. Omit it when text or the enclosing control ' +
        'already names it: the icon is then `aria-hidden`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LanguagesIcon>;

/** Standing alone, so it carries its own accessible name. */
export const Standalone: Story = {
  args: { label: 'Language', style: { fontSize: 32 } },
};

/** Inside an IconButton, which carries the name; the icon is hidden. */
export const InIconButton: Story = {
  render: function InIconButtonStory() {
    return (
      <IconButton aria-label="Language">
        <LanguagesIcon />
      </IconButton>
    );
  },
};

/** Next to text, at the text's size and colour. */
export const WithText: Story = {
  render: function WithTextStory() {
    return (
      <Badge variant="outline">
        <LanguagesIcon /> English
      </Badge>
    );
  },
};
