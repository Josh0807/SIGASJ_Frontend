export type TransparencyFileType = 'pdf' | 'jpg' | 'jpeg' | 'png'

export type TransparencyPublication = {
  id: string
  name: string
  description: string
  fileUrl: string
  fileType: TransparencyFileType
}
