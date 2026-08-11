import type { TransparencyFileType } from '../props/TransparencySectionProps'

export const getTransparencyActionLabel = (
  fileType: TransparencyFileType,
): string => {
  if (fileType === 'pdf') {
    return 'Ver documento'
  }

  return 'Ver imagen'
}

export const TRANSPARENCY_FILE_LINK_REL = 'noopener noreferrer' as const

export const TRANSPARENCY_FILE_LINK_TARGET = '_blank' as const
