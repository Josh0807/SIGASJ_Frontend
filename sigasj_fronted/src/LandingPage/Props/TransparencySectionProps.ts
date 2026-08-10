export type TransparencyFileType = 'pdf' | 'jpg' | 'jpeg' | 'png'

export type TransparencyPublication = {
  id: string
  name: string
  description: string
  fileUrl: string
  fileType: TransparencyFileType
}

export type TransparencyCardProps = {
  id: string
  name: string
  description: string
  fileUrl: string
  fileType: TransparencyFileType
}

export type TransparencySectionProps = {
  id?: string
  title?: string
  description?: string
  publications?: TransparencyPublication[]
  emptyMessage?: string
  errorMessage?: string
}
