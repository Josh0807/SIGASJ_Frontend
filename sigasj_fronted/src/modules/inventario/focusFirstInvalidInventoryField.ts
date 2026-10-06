export function focusFirstInvalidInventoryField(form: EventTarget | null) {
  const root = form instanceof HTMLElement ? form : document
  window.setTimeout(() => {
    root.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, 0)
}
