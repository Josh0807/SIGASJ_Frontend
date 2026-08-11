/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PUBLIC_ANNOUNCEMENTS_PATH?: string
  readonly VITE_PUBLIC_GALLERY_PATH?: string
  readonly VITE_ADMIN_GALLERY_PATH?: string
  readonly VITE_PUBLIC_TRANSPARENCIA_PATH?: string
  readonly VITE_ADMIN_TRANSPARENCIA_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
