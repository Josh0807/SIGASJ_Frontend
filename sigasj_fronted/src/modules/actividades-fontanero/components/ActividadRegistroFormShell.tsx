import { type FormEvent, useCallback, useRef, useState } from 'react'
import { hoyEnAsada } from '../../../shared/utils/fechaAsada'
import { Link, useNavigate } from 'react-router-dom'
import type { TipoActividadFontaneroCatalogo } from '../types/tipoActividadFontanero'
import {
  createActividadRegistroFormInitial,
  type ActividadRegistroFormField,
  type ActividadRegistroFormValues,
} from '../types/actividadRegistroForm'
import type {
  ActividadFontaneroRegistrada,
  DocumentoActividadRegistrado,
} from '../types/actividadFontaneroApi'
import {
  hasActividadRegistroFormErrors,
  validateActividadRegistroForm,
  type ActividadRegistroFormErrors,
} from '../utils/validateActividadRegistroForm'
import {
  ACTIVIDAD_CORRECCION_CLIENT_VALIDATION_ERROR,
  ACTIVIDAD_REGISTRO_CLIENT_VALIDATION_ERROR,
  parseActividadRegistroSubmitError,
  toActividadRegistroSubmitMessage,
} from '../utils/actividadRegistroSubmitError'
import { focusFirstActividadRegistroError } from '../utils/focusFirstActividadRegistroError'
import { registrarActividad } from '../services/actividadesFontaneroApi'
import ActivityFeedback from './ActivityFeedback'
import ActividadRegistroFieldError from './ActividadRegistroFieldError'
import ActividadRegistroValidationSummary from './ActividadRegistroValidationSummary'
import DocumentoActividadUploader from './DocumentoActividadUploader'
import EvidenciaFotoGaleria from './EvidenciaFotoGaleria'
import { FORMULARIOS_ACTIVIDAD } from './formularios/formulariosActividadRegistry'
import {
  FOTO_EVIDENCIA_ACCEPT,
  FOTO_EVIDENCIA_MAX_FILES,
  validateFotoEvidencia,
} from '../utils/validateDocumentoActividad'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { useAuth } from '../../auth/components/AuthContext'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { IconArrowLeft, IconCheck, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react'

type ActividadRegistroFormShellMode = 'registrar' | 'corregir' | 'editar-borrador'

export type ActividadRegistroSubmitIntent = 'registrar' | 'borrador'

type ActividadRegistroFormShellProps = {
  mode?: ActividadRegistroFormShellMode
  tipo: TipoActividadFontaneroCatalogo
  initialValues?: ActividadRegistroFormValues
  existingDocumentos?: DocumentoActividadRegistrado[]
  actividadId?: number
  observacionCorreccion?: string | null
  onSubmit?: (
    values: ActividadRegistroFormValues,
    extras?: {
      documentosEliminarIds: number[]
      intent: ActividadRegistroSubmitIntent
    },
  ) => Promise<ActividadFontaneroRegistrada | void>
  onDelete?: () => Promise<void>
  onCatalogStale?: () => void
}

const ActividadRegistroFormShell = ({
  mode = 'registrar',
  tipo,
  initialValues,
  existingDocumentos = [],
  actividadId = 0,
  observacionCorreccion,
  onSubmit,
  onDelete,
  onCatalogStale,
}: ActividadRegistroFormShellProps) => {
  const isCorregirMode = mode === 'corregir'
  const isEditBorrador = mode === 'editar-borrador'
  const lockInicio = isCorregirMode || isEditBorrador
  const navigate = useNavigate()
  const { logout } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const intentRef = useRef<ActividadRegistroSubmitIntent>('registrar')
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const hoyAsada = hoyEnAsada()
  const [values, setValues] = useState<ActividadRegistroFormValues>(
    () => initialValues ?? createActividadRegistroFormInitial(),
  )
  const [documentosVivos, setDocumentosVivos] = useState<
    DocumentoActividadRegistrado[]
  >(existingDocumentos)
  const ocultaUbicacionYObservaciones = tipo.codigo === 'INCAPACIDAD_VACACIONES'
  const [errors, setErrors] = useState<ActividadRegistroFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [registrada, setRegistrada] = useState<ActividadFontaneroRegistrada | null>(
    null,
  )
  const [savedAsDraft, setSavedAsDraft] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const FormularioEspecifico = FORMULARIOS_ACTIVIDAD[tipo.codigo]

  const updateField = useCallback(
    (field: ActividadRegistroFormField, value: string) => {
      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => {
        if (!current[field]) {
          return current
        }
        const next = { ...current }
        delete next[field]
        if (field === 'fechaActividad') {
          delete next.fechaFin
          delete next.horaFin
        }
        return next
      })
      setSubmitError(null)
      setIsSuccess(false)
    },
    [],
  )

  const scrollToFormAlert = useCallback(() => {
    queueMicrotask(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const applyValidationErrors = useCallback(
    (nextErrors: ActividadRegistroFormErrors, message: string) => {
      setErrors(nextErrors)
      setSubmitError(message)
      scrollToFormAlert()
      queueMicrotask(() => {
        focusFirstActividadRegistroError(nextErrors, formRef.current ?? document)
      })
    },
    [scrollToFormAlert],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const submitterButton =
      submitter instanceof HTMLElement ? submitter.closest('button') : null
    const fromSubmitter = submitterButton?.value
    const intent: ActividadRegistroSubmitIntent =
      fromSubmitter === 'borrador' || fromSubmitter === 'registrar'
        ? fromSubmitter
        : intentRef.current

    const submitValues: ActividadRegistroFormValues =
      intent === 'borrador' ? { ...values, fechaFin: '', horaFin: '' } : values

    const nextErrors = validateActividadRegistroForm(
      submitValues,
      tipo.codigo,
      isCorregirMode ? 'corregir' : intent === 'borrador' ? 'borrador' : 'registrar',
    )
    if (
      documentosVivos.length + values.documentos.length >
      FOTO_EVIDENCIA_MAX_FILES
    ) {
      nextErrors.documentos = `Puede conservar y adjuntar un máximo de ${FOTO_EVIDENCIA_MAX_FILES} fotos.`
    }
    if (hasActividadRegistroFormErrors(nextErrors)) {
      applyValidationErrors(
        nextErrors,
        isCorregirMode
          ? ACTIVIDAD_CORRECCION_CLIENT_VALIDATION_ERROR
          : ACTIVIDAD_REGISTRO_CLIENT_VALIDATION_ERROR,
      )
      return
    }

    setErrors({})
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const documentosEliminarIds = existingDocumentos
        .filter(
          (documento) =>
            !documentosVivos.some((vivo) => vivo.id === documento.id),
        )
        .map((documento) => documento.id)

      const result = onSubmit
        ? await onSubmit(submitValues, { documentosEliminarIds, intent })
        : await registrarActividad(tipo, submitValues, {
            esBorrador: intent === 'borrador',
          })

      if (result && typeof result === 'object' && 'id' in result) {
        setRegistrada(result)
      }
      setSavedAsDraft(intent === 'borrador')
      setIsSuccess(true)
      if (!isCorregirMode) {
        setValues(createActividadRegistroFormInitial())
      }
      setErrors({})
      scrollToFormAlert()
      window.dispatchEvent(new CustomEvent('actividades-fontanero:updated'))
    } catch (error) {
      const parsed = parseActividadRegistroSubmitError(error)

      if (parsed.kind === 'validation') {
        applyValidationErrors(
          { ...parsed.fieldErrors },
          parsed.formMessage ?? ACTIVITY_FEEDBACK_MESSAGES.validationReview,
        )
        return
      }

      if (parsed.kind === 'not-found') {
        onCatalogStale?.()
      }
      if (parsed.kind === 'unauthorized') {
        logout()
        navigate('/login', { replace: true })
        return
      }

      // Conserva valores del formulario ante 403 / 5xx / red / save.
      setSubmitError(
        toActividadRegistroSubmitMessage(error, {
          mode: isCorregirMode ? 'corregir' : 'registrar',
        }),
      )
      scrollToFormAlert()
    } finally {
      setIsSubmitting(false)
    }
  }

  const backLink = isCorregirMode
    ? {
        to: ACTIVIDADES_FONTANERO_PATHS.correcciones,
        label: 'Volver a correcciones',
      }
    : isEditBorrador
      ? {
          to: ACTIVIDADES_FONTANERO_PATHS.misActividades,
          label: 'Volver a mis actividades',
        }
      : {
          to: ACTIVIDADES_FONTANERO_PATHS.nueva,
          label: 'Cambiar tipo de actividad',
        }

  return (
    <section
      ref={sectionRef}
      className={`actividades-fontanero-registro !mx-0 !max-w-none !gap-7${
        isCorregirMode ? ' actividades-fontanero-registro--corregir' : ''
      }`}
      aria-labelledby="actividad-registro-title"
    >
      <header className="actividades-fontanero-registro__header !block !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="actividades-fontanero-registro__eyebrow !text-sm !font-black !tracking-[0.12em] !text-blue-600">Registro de Actividades</p>
            <h1 id="actividad-registro-title" className="!text-3xl !font-black !tracking-tight !text-[#07376f] md:!text-4xl">
          {isCorregirMode
            ? `Corregir: ${tipo.nombre}`
            : isEditBorrador
              ? `Editar borrador: ${tipo.nombre}`
              : `Registrar: ${tipo.nombre}`}
        </h1>
        <p className="actividades-fontanero-registro__intro !text-lg !leading-relaxed !text-slate-500">
          {isCorregirMode
            ? 'Revise el motivo de corrección, ajuste los campos permitidos y reenvíe la actividad.'
            : 'Complete la información general y los campos del formulario correspondiente.'}
            </p>
          </div>
          <Link
            to={backLink.to}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 font-bold !no-underline text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 hover:!no-underline focus:!no-underline"
          >
            <IconArrowLeft size={20} aria-hidden="true" />
            {backLink.label}
          </Link>
        </div>
      </header>

      {isCorregirMode && observacionCorreccion ? (
        <div
          className="actividades-fontanero-registro__correccion-banner"
          role="note"
          aria-label="Motivo de corrección"
          data-testid="correccion-motivo-banner"
        >
          <p className="actividades-fontanero-registro__correccion-label">
            Motivo de corrección
          </p>
          <p className="actividades-fontanero-registro__correccion-texto">
            {observacionCorreccion}
          </p>
        </div>
      ) : null}

      {isSuccess ? (
        <ActivityFeedback
          variant="success"
          testId="actividad-registro-exito"
          message={
            <p>
              {isCorregirMode
                ? `${ACTIVITY_FEEDBACK_MESSAGES.successCorrect}${
                    registrada?.id ? ` (registro #${registrada.id})` : ''
                  }`
                : savedAsDraft
                  ? `Borrador guardado${
                      registrada?.id ? ` (registro #${registrada.id})` : ''
                    }. No se envió a administradora.`
                  : `${ACTIVITY_FEEDBACK_MESSAGES.successRegister.replace(
                    /\.$/,
                    '',
                  )}${tipo.nombre ? `: ${tipo.nombre}` : ''}${
                    registrada?.id ? ` (registro #${registrada.id})` : ''
                  }.`}
            </p>
          }
          action={
            <Link
              to={
                isCorregirMode
                  ? ACTIVIDADES_FONTANERO_PATHS.correcciones
                  : isEditBorrador
                    ? ACTIVIDADES_FONTANERO_PATHS.misActividades
                    : ACTIVIDADES_FONTANERO_PATHS.nueva
              }
              className="actividades-fontanero-registro__link"
            >
              {isCorregirMode || isEditBorrador ? (
                <IconArrowLeft size={18} aria-hidden="true" />
              ) : (
                <IconPlus size={19} aria-hidden="true" />
              )}
              {isCorregirMode
                ? 'Volver a correcciones pendientes'
                : isEditBorrador
                  ? 'Volver a mis actividades'
                  : 'Nueva actividad'}
            </Link>
          }
        />
      ) : (
        <form
          ref={formRef}
          className="actividad-registro-form !gap-7 !rounded-[28px] !border-blue-100 !bg-white/90 !p-5 !shadow-[0_14px_38px_rgba(30,90,156,0.08)] md:!p-8"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
        >
          <div className="border-b border-blue-100 pb-6">
            <p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Formulario de registro</p>
            <h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Datos de {tipo.nombre}</h2>
            <p className="mt-2 text-base leading-relaxed text-slate-500">Complete los datos generales y la información específica de esta actividad.</p>
          </div>
          {Object.keys(errors).length > 0 || submitError ? (
            <ActividadRegistroValidationSummary
              errors={errors}
              generalMessage={submitError}
            />
          ) : null}

          <fieldset className="actividad-registro-form__section !grid !grid-cols-1 !gap-5 !rounded-3xl !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/50 !p-5 md:!grid-cols-2 md:!p-7" disabled={isSubmitting}>
            <legend className="actividad-registro-form__legend">Información general</legend>

            <div
              className={`actividad-registro-form__field${
                errors.fechaActividad ? ' actividad-registro-form__field--invalid' : ''
              }`}
            >
              <label className="actividad-registro-form__label" htmlFor="fechaActividad">
                Fecha de inicio{' '}
                <span className="actividad-registro-form__required" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="fechaActividad"
                name="fechaActividad"
                type="date"
                className={`actividad-registro-form__input${
                  errors.fechaActividad ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.fechaActividad}
                max={hoyAsada}
                onChange={(event) => updateField('fechaActividad', event.target.value)}
                aria-invalid={Boolean(errors.fechaActividad)}
                aria-describedby={
                  errors.fechaActividad ? 'fechaActividad-error' : undefined
                }
                readOnly={lockInicio}
                disabled={lockInicio}
                required
              />
              {errors.fechaActividad ? (
                <ActividadRegistroFieldError
                  id="fechaActividad-error"
                  message={errors.fechaActividad}
                />
              ) : null}
            </div>

            <div
              className={`actividad-registro-form__field${
                errors.horaInicio ? ' actividad-registro-form__field--invalid' : ''
              }`}
            >
              <label className="actividad-registro-form__label" htmlFor="horaInicio">
                Hora de inicio{' '}
                <span className="actividad-registro-form__required" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="horaInicio"
                name="horaInicio"
                type="time"
                className={`actividad-registro-form__input${
                  errors.horaInicio ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.horaInicio}
                onChange={(event) => updateField('horaInicio', event.target.value)}
                aria-invalid={Boolean(errors.horaInicio)}
                aria-describedby={errors.horaInicio ? 'horaInicio-error' : undefined}
                readOnly={lockInicio}
                disabled={lockInicio}
                required
              />
              {errors.horaInicio ? (
                <ActividadRegistroFieldError
                  id="horaInicio-error"
                  message={errors.horaInicio}
                />
              ) : null}
            </div>

            <div
              className={`actividad-registro-form__field${
                errors.fechaFin ? ' actividad-registro-form__field--invalid' : ''
              }`}
            >
              <label className="actividad-registro-form__label" htmlFor="fechaFin">
                Fecha de finalización{' '}
                <span className="actividad-registro-form__required" aria-hidden="true">
                  *
                </span>
                {isCorregirMode ? null : (
                  <span className="ml-1 text-xs font-semibold normal-case tracking-normal text-slate-400">
                    {isEditBorrador
                      ? '(opcional en borrador)'
                      : '(al registrar)'}
                  </span>
                )}
              </label>
              <input
                id="fechaFin"
                name="fechaFin"
                type="date"
                className={`actividad-registro-form__input${
                  errors.fechaFin ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.fechaFin}
                max={hoyAsada}
                onChange={(event) => updateField('fechaFin', event.target.value)}
                aria-invalid={Boolean(errors.fechaFin)}
                aria-describedby={errors.fechaFin ? 'fechaFin-error' : undefined}
                readOnly={isCorregirMode}
                disabled={isCorregirMode}
              />
              {errors.fechaFin ? (
                <ActividadRegistroFieldError id="fechaFin-error" message={errors.fechaFin} />
              ) : null}
            </div>

            <div
              className={`actividad-registro-form__field${
                errors.horaFin ? ' actividad-registro-form__field--invalid' : ''
              }`}
            >
              <label className="actividad-registro-form__label" htmlFor="horaFin">
                Hora de finalización{' '}
                <span className="actividad-registro-form__required" aria-hidden="true">
                  *
                </span>
                {isCorregirMode ? null : (
                  <span className="ml-1 text-xs font-semibold normal-case tracking-normal text-slate-400">
                    {isEditBorrador
                      ? '(opcional en borrador)'
                      : '(al registrar)'}
                  </span>
                )}
              </label>
              <input
                id="horaFin"
                name="horaFin"
                type="time"
                className={`actividad-registro-form__input${
                  errors.horaFin ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.horaFin}
                onChange={(event) => updateField('horaFin', event.target.value)}
                aria-invalid={Boolean(errors.horaFin)}
                aria-describedby={errors.horaFin ? 'horaFin-error' : undefined}
                readOnly={isCorregirMode}
                disabled={isCorregirMode}
              />
              {errors.horaFin ? (
                <ActividadRegistroFieldError id="horaFin-error" message={errors.horaFin} />
              ) : null}
            </div>

            <div
              className={`actividad-registro-form__field md:!col-span-2${
                errors.titulo ? ' actividad-registro-form__field--invalid' : ''
              }`}
            >
              <label className="actividad-registro-form__label" htmlFor="titulo">
                Título o resumen{' '}
                <span className="actividad-registro-form__required" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                maxLength={200}
                className={`actividad-registro-form__input${
                  errors.titulo ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.titulo}
                onChange={(event) => updateField('titulo', event.target.value)}
                aria-invalid={Boolean(errors.titulo)}
                aria-describedby={errors.titulo ? 'titulo-error' : undefined}
                required
              />
              {errors.titulo ? (
                <ActividadRegistroFieldError id="titulo-error" message={errors.titulo} />
              ) : null}
            </div>

            <div
              className={`actividad-registro-form__field md:!col-span-2${
                errors.descripcion ? ' actividad-registro-form__field--invalid' : ''
              }`}
            >
              <label className="actividad-registro-form__label" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                className={`actividad-registro-form__textarea${
                  errors.descripcion ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.descripcion}
                onChange={(event) => updateField('descripcion', event.target.value)}
                aria-invalid={Boolean(errors.descripcion)}
                aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
              />
              {errors.descripcion ? (
                <ActividadRegistroFieldError
                  id="descripcion-error"
                  message={errors.descripcion}
                />
              ) : null}
            </div>

            {ocultaUbicacionYObservaciones ? null : (
              <>
                <div
                  className={`actividad-registro-form__field${
                    errors.ubicacion ? ' actividad-registro-form__field--invalid' : ''
                  }`}
                >
                  <label className="actividad-registro-form__label" htmlFor="ubicacion">
                    Ubicación
                  </label>
                  <input
                    id="ubicacion"
                    name="ubicacion"
                    type="text"
                    maxLength={200}
                    className={`actividad-registro-form__input${
                      errors.ubicacion ? ' actividad-registro-form__input--error' : ''
                    }`}
                    value={values.ubicacion}
                    onChange={(event) => updateField('ubicacion', event.target.value)}
                    aria-invalid={Boolean(errors.ubicacion)}
                    aria-describedby={errors.ubicacion ? 'ubicacion-error' : undefined}
                  />
                  {errors.ubicacion ? (
                    <ActividadRegistroFieldError
                      id="ubicacion-error"
                      message={errors.ubicacion}
                    />
                  ) : null}
                </div>

                <div className="actividad-registro-form__field md:!col-span-2">
                  <label className="actividad-registro-form__label" htmlFor="observaciones">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    rows={3}
                    className="actividad-registro-form__textarea"
                    value={values.observaciones}
                    onChange={(event) => updateField('observaciones', event.target.value)}
                    readOnly={isCorregirMode}
                    disabled={isCorregirMode}
                  />
                </div>
              </>
            )}
          </fieldset>

          <FormularioEspecifico
            values={values}
            errors={errors}
            disabled={isSubmitting}
            onChange={updateField}
            onFilesChange={(files) => {
              if (isCorregirMode) {
                return
              }
              setValues((current) => ({ ...current, documentos: files }))
              setErrors((current) => {
                const next = { ...current }
                delete next.documentos
                return next
              })
              setSubmitError(null)
            }}
          />

          <fieldset
            className="actividad-registro-form__section actividad-formulario-especifico !gap-5 !rounded-3xl !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/60 !p-5 !shadow-sm md:!p-7"
            disabled={isSubmitting}
          >
            <legend className="actividad-registro-form__legend">Evidencia fotográfica</legend>
            <p className="actividad-formulario-especifico__hint !mt-0">
              {isCorregirMode || isEditBorrador
                ? 'Toque una foto para verla más grande. Puede borrar las que no correspondan y adjuntar fotos nuevas.'
                : 'Opcional. Adjunte fotos del trabajo realizado.'}
            </p>
            {isCorregirMode || isEditBorrador ? (
              <EvidenciaFotoGaleria
                documentos={documentosVivos}
                actividadId={actividadId || existingDocumentos[0]?.actividadId || 0}
                canDelete
                disabled={isSubmitting}
                emptyLabel="Esta actividad no tiene fotos adjuntas."
                onDelete={(documento) => {
                  setDocumentosVivos((current) =>
                    current.filter((item) => item.id !== documento.id),
                  )
                }}
              />
            ) : null}
            <div
              className={`actividad-registro-form__field${
                errors.documentos ? ' actividad-registro-form__field--invalid' : ''
              }`}
            >
              <label className="actividad-registro-form__label" htmlFor="documentos">
                {isCorregirMode ? 'Fotos nuevas (opcional)' : 'Fotos de evidencia'}
              </label>
              <DocumentoActividadUploader
                files={values.documentos}
                onChange={(files) => {
                  setValues((current) => ({ ...current, documentos: files }))
                  setErrors((current) => {
                    const next = { ...current }
                    delete next.documentos
                    return next
                  })
                  setSubmitError(null)
                }}
                error={errors.documentos}
                disabled={isSubmitting}
                multiple
                accept={FOTO_EVIDENCIA_ACCEPT}
                validateFile={validateFotoEvidencia}
                buttonLabel="Agregar fotos"
                dropHint="Arrastre las fotos aquí o selecciónelas con el botón."
                  helpText="Formatos: JPG, JPEG y PNG. Máximo 10 MB por foto. Hasta 5 fotos en total."
                  listLabel="Fotos seleccionadas"
                  maxFiles={Math.max(
                    0,
                    FOTO_EVIDENCIA_MAX_FILES -
                      (isCorregirMode || isEditBorrador ? documentosVivos.length : 0),
                  )}
              />
            </div>
          </fieldset>

          <div
            className={`actividad-registro-form__actions !gap-4 !border-t !border-blue-100 !pt-6${
              isEditBorrador ? ' actividad-registro-form__actions--split' : ''
            }`}
          >
            <div className="actividad-registro-form__actions-group">
              {isEditBorrador && onDelete ? (
                <button
                  ref={deleteButtonRef}
                  type="button"
                  className="actividad-registro-form__button actividad-registro-form__button--danger !gap-2 !rounded-2xl !px-6 !py-3.5 !font-bold !shadow-md"
                  disabled={isSubmitting}
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <IconTrash size={20} aria-hidden="true" />
                  Eliminar actividad
                </button>
              ) : null}
              <Link
                to={
                  isCorregirMode
                    ? ACTIVIDADES_FONTANERO_PATHS.correcciones
                    : isEditBorrador
                      ? ACTIVIDADES_FONTANERO_PATHS.misActividades
                      : ACTIVIDADES_FONTANERO_PATHS.nueva
                }
                className="actividad-registro-form__button actividad-registro-form__button--secondary !gap-2 !rounded-2xl !border-blue-200 !bg-white !px-6 !py-3.5 !font-bold !text-blue-700 !shadow-md transition hover:!-translate-y-0.5 hover:!bg-blue-50"
              >
                <IconArrowLeft size={20} aria-hidden="true" />
                {isEditBorrador ? 'Cancelar edición' : 'Cancelar'}
              </Link>
            </div>
            <div className="actividad-registro-form__actions-group">
              {isCorregirMode ? null : (
                <button
                  type="submit"
                  name="intent"
                  value="borrador"
                  className="actividad-registro-form__button actividad-registro-form__button--draft !gap-2 !rounded-2xl !px-6 !py-3.5 !font-bold !shadow-md"
                  disabled={isSubmitting}
                  onClick={() => {
                    intentRef.current = 'borrador'
                  }}
                >
                  <IconDeviceFloppy size={20} aria-hidden="true" />
                  {isSubmitting ? 'Guardando…' : 'Guardar borrador'}
                </button>
              )}
              <button
                type="submit"
                name="intent"
                value="registrar"
                className="actividad-registro-form__button actividad-registro-form__button--primary !gap-2 !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-sky-500 !px-7 !py-3.5 !font-bold !text-white !shadow-lg !shadow-blue-200 transition hover:!-translate-y-0.5 hover:!from-blue-700 hover:!to-sky-600"
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
                onClick={() => {
                  intentRef.current = 'registrar'
                }}
              >
                {isSubmitting ? null : isCorregirMode ? (
                  <IconCheck size={20} aria-hidden="true" />
                ) : (
                  <IconCheck size={20} aria-hidden="true" />
                )}
                {isSubmitting
                  ? isCorregirMode
                    ? 'Reenviando…'
                    : 'Registrando…'
                  : isCorregirMode
                    ? 'Reenviar actividad corregida'
                    : 'Registrar actividad'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!isSuccess ? (
        <Link
          to={backLink.to}
          className="actividades-fontanero-registro__back !hidden"
        >
          <IconArrowLeft size={20} aria-hidden="true" />
          {backLink.label}
        </Link>
      ) : null}

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Eliminar borrador"
        message="¿Eliminar este borrador? Esta acción no se puede deshacer."
        cancelLabel="Cancelar"
        confirmLabel={isSubmitting ? 'Eliminando…' : 'Eliminar borrador'}
        confirmDanger
        returnFocusRef={deleteButtonRef}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          if (!onDelete || isSubmitting) {
            return
          }
          setConfirmDeleteOpen(false)
          void (async () => {
            setIsSubmitting(true)
            try {
              await onDelete()
            } catch (error) {
              setSubmitError(
                toActividadRegistroSubmitMessage(error, { mode: 'registrar' }),
              )
              scrollToFormAlert()
            } finally {
              setIsSubmitting(false)
            }
          })()
        }}
      />
    </section>
  )
}

export default ActividadRegistroFormShell
