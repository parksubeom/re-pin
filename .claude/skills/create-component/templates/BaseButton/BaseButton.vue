<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { computed, type HTMLAttributes } from 'vue'

import { cn } from '@/shared/lib'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
        secondary:
          'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
        ghost:
          'border border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  /** Extra classes merged via `cn` (tailwind-merge resolves conflicts). */
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  class: '',
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class),
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes" @click="$emit('click', $event)">
    <slot />
  </button>
</template>
