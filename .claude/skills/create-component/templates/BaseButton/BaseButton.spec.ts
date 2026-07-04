import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  it('renders the default slot content', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Save' } })
    expect(wrapper.text()).toBe('Save')
  })

  it('applies variant-specific classes', () => {
    expect(mount(BaseButton, { props: { variant: 'primary' } }).classes()).toContain(
      'bg-emerald-600',
    )
    expect(mount(BaseButton, { props: { variant: 'ghost' } }).classes()).toContain('border')
  })

  it('applies size classes', () => {
    expect(mount(BaseButton, { props: { size: 'lg' } }).classes()).toContain('h-11')
  })

  it('merges an external class and resolves conflicts via tailwind-merge', () => {
    // default size `md` is `px-4`; passing `px-2` should win and drop `px-4`.
    const classes = mount(BaseButton, { props: { class: 'px-2' } }).classes()
    expect(classes).toContain('px-2')
    expect(classes).not.toContain('px-4')
  })

  it('emits click when pressed', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
