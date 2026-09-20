import type { ReactNode } from 'react'

export type FormSuccessResultMeta = {
  label: string
  value: string
}

export type FormSuccessResultProps = {
  title: string
  description?: string
  highlightLabel?: string
  highlightValue?: string
  meta?: FormSuccessResultMeta[]
  hint?: string
  actions?: ReactNode
  className?: string
  titleClassName?: string
  highlightLabelClassName?: string
  highlightValueClassName?: string
}