import { describe, expect, it } from 'vitest'
import { buildSageDemoReply } from './sageIaDemoReplies'

describe('buildSageDemoReply', () => {
  it('explica la pantalla actual', () => {
    const reply = buildSageDemoReply(
      'Explícame esta pantalla',
      '/admin/averias',
    )
    expect(reply).toContain('Gestión de averías')
    expect(reply).toContain('Menú izquierdo')
  })

  it('indica cómo asignar un fontanero', () => {
    const reply = buildSageDemoReply(
      '¿Cómo asigno un fontanero?',
      '/admin/averias',
    )
    expect(reply.toLowerCase()).toContain('asign')
    expect(reply).toContain('Ver detalle')
  })

  it('orienta sobre inventario', () => {
    const reply = buildSageDemoReply(
      '¿Cómo registro una entrada de inventario?',
      '/admin/inventario',
    )
    expect(reply.toLowerCase()).toContain('entrada')
  })

  it('responde consultas genéricas con pista del módulo', () => {
    const reply = buildSageDemoReply(
      'quiero reordenar las fotos del avance',
      '/admin/proyectos',
    )
    expect(reply).toMatch(/proyecto|galer/i)
  })

  it('responde ayuda general orientando al panel', () => {
    const reply = buildSageDemoReply('necesito ayuda', '/admin/dashboard')
    expect(reply).toContain('panel SIGASJ')
  })
})
