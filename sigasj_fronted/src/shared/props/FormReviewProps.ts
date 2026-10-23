import type { ReactNode } from 'react'

export type FormReviewItem = {
  label: string
  value: ReactNode
}

export type FormReviewSection = {
  id: string
  title: string
  stepIndex: number
  items: readonly FormReviewItem[]
}

export type FormReviewDocument = {
  id: string
  name: string
  size?: number
  type?: string
}

export type FormReviewProps = {
  sections: readonly FormReviewSection[]
  documents?: readonly FormReviewDocument[]
  documentsStepIndex?: number
  emptyValue?: string
  emptyDocumentsMessage?: string
  className?: string
}
