import { describe, expect, it } from 'vitest'
import { getTransparencyActionLabel } from './transparencyCard.utils'

describe('getTransparencyActionLabel', () => {
  it('usa "Ver documento" para PDF', () => {
    expect(getTransparencyActionLabel('pdf')).toBe('Ver documento')
  })

  it.each(['jpg', 'jpeg', 'png'] as const)(
    'usa "Ver imagen" para %s',
    (fileType) => {
      expect(getTransparencyActionLabel(fileType)).toBe('Ver imagen')
    },
  )
})
