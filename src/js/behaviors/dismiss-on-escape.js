import { isFunction } from "../base/primitive-utils"

export const DISMISS_ON_ESCAPE_DEFAULTS = {
  onEscape: null
}

export const applyDismissOnEscape = (options = {}) => {
  const effectiveOptions = {...DISMISS_ON_ESCAPE_DEFAULTS, ...options }

  if (!isFunction(effectiveOptions.onEscape))
    throw new Error('onEscape must be a function')

  const handleKeyDown = (e) => {
    if (event.key !== 'Escape')
      return

    effectiveOptions.onEscape(e)
  }

  document.addEventListener('keydown', handleKeyDown)

  return {
    destroy() {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }
}