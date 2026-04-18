import { isElement } from "../base/element-utils"
import { isFunction } from "../base/primitive-utils"

export const LONG_PRESS_DEFAULTS = {
  delay: 500 // milliseconds to trigger long press
}

export const applyLongPress = (element, onLongPress, options = {}) => {
  if(!isElement(element))
    throw new Error('Target must be element')

  if(onLongPress && !isFunction(onLongPress))
    throw new Error('onLongPress callback must be function')

  const effectiveOptions = { ...LONG_PRESS_DEFAULTS, ...options }
  let longPressTimer = null

  const onPointerDown = () => {
    clearTimeout(longPressTimer)
    longPressTimer = setTimeout(() => {
      onLongPress()
    }, effectiveOptions.delay)
  }

  const onPointerUp = () => {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('pointerup', onPointerUp)

  return {
    destroy: () => {
      clearTimeout(longPressTimer)
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointerup', onPointerUp)
    }
  }
}
