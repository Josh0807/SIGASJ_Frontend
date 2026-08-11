export const queryKeys = {
  galeria: {
    public: ['galeria', 'public'] as const,
    admin: (filters: { titulo?: string; activo?: boolean }) =>
      ['galeria', 'admin', filters] as const,
  },
  comunicados: {
    public: ['comunicados', 'public'] as const,
  },
  transparencia: {
    public: ['transparencia', 'public'] as const,
  },
}
