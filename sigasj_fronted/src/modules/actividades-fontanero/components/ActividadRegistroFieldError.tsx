type ActividadRegistroFieldErrorProps = {
  id: string
  message: string
}

const ActividadRegistroFieldError = ({ id, message }: ActividadRegistroFieldErrorProps) => (
  <p id={id} className="actividad-registro-form__error" role="alert">
    <span className="actividad-registro-form__error-icon" aria-hidden="true">
      ⚠
    </span>
    <span>{message}</span>
  </p>
)

export default ActividadRegistroFieldError
