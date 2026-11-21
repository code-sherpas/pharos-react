import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbText,
} from './Breadcrumb';

/**
 * `Breadcrumb` goes on the inner screens of a section — the detail of an item,
 * a step on it — and says where the person is and the way up: the section,
 * the item, and the current screen last. A level the person can open is an
 * underlined `BreadcrumbLink`; one they cannot open is `BreadcrumbText`; the
 * current screen is `BreadcrumbPage`, not a link, marked as the page. The
 * separators are not read. The consumer writes every word, the region's name
 * included. Long names wrap; nothing is cut.
 *
 * A page the main navigation opens does not need one.
 */
const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  args: { 'aria-label': 'Breadcrumb' },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/** Section › item › step: the report of an assessment. */
export const SectionItemAndStep: Story = {
  render: function SectionItemAndStep(args) {
    return (
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#assessments">Competency assessments</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#assessment">Q3 engineering review</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Report</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
  play: async function currentScreenIsThePage({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
    await expect(canvas.getByText('Report')).toHaveAttribute('aria-current', 'page');
  },
};

/** The detail of an item: the section, and the item as the current screen. */
export const SectionAndItem: Story = {
  render: function SectionAndItem(args) {
    return (
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#team">Team</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ada Lovelace</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
};

/**
 * A level the person cannot open — here, a member's page, which only admins
 * and editors open — is text: not a link, and not the current screen either.
 */
export const LevelThatCannotBeOpened: Story = {
  render: function LevelThatCannotBeOpened(args) {
    return (
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#team">Team</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbText>Grace Hopper</BreadcrumbText>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
  play: async function onlyTheSectionIsALink({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(canvas.getByText('Grace Hopper')).not.toHaveAttribute('aria-current');
  },
};

/**
 * Long names on a phone: every level wraps onto more lines and stays whole,
 * at 320 px.
 */
export const LongNamesOnAPhone: Story = {
  decorators: [
    function Phone(Story) {
      return (
        <div style={{ inlineSize: '288px', outline: '1px dashed currentColor' }}>
          <Story />
        </div>
      );
    },
  ],
  render: function LongNamesOnAPhone(args) {
    return (
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#assessments">Evaluaciones de competencias</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#assessment">
              Evaluación anual de competencias técnicas del equipo de plataforma 2026
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Informe de «Evaluación anual de competencias técnicas»</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
  play: async function nothingOverflows({ canvasElement }) {
    const nav = within(canvasElement).getByRole('navigation');
    await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth);
  },
};

/** In right-to-left text the levels run from the right and the chevrons point left. */
export const RightToLeft: Story = {
  decorators: [
    function Rtl(Story) {
      return (
        <div dir="rtl" lang="ar">
          <Story />
        </div>
      );
    },
  ],
  args: { 'aria-label': 'مسار التنقل' },
  render: function RightToLeft(args) {
    return (
      <Breadcrumb {...args}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#team">الفريق</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>آدا لوفليس</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
};
