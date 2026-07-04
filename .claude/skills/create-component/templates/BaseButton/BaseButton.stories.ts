import BaseButton from './BaseButton.vue'

import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'shared/ui/BaseButton',
  component: BaseButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  render: (args) => ({
    components: { BaseButton },
    setup: () => ({ args }),
    template: '<BaseButton v-bind="args">Button</BaseButton>',
  }),
} satisfies Meta<typeof BaseButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Large: Story = { args: { size: 'lg' } }
export const Small: Story = { args: { size: 'sm' } }
export const Disabled: Story = { args: { disabled: true } }
