import { isElement } from "../base/element-utils"

export const CLICK_TOGGLE_DEFAULTS = {
  toggleMode: 'class', // or 'attribute'
  toggleProperty: 'active',// class name or attribute name to toggle
  toggleTargetId: null // optional id of element to toggle, defaults to the element itself
}

export const applyClickToggle = (element, options = {}) => {
  if(!isElement(element))
    throw new Error('Target must be element')

  const effectiveOptions = { ...CLICK_TOGGLE_DEFAULTS, ...options }
  const elementToSetToggleState = effectiveOptions.toggleTargetId ? document.getElementById(effectiveOptions.toggleTargetId) : element

  if(!isElement(elementToSetToggleState))
    throw new Error('Toggle target must be element')

  const onClick = () => {
    if (effectiveOptions.toggleMode === 'attribute') {
      if (elementToSetToggleState.hasAttribute(effectiveOptions.toggleProperty)) {
        elementToSetToggleState.removeAttribute(effectiveOptions.toggleProperty)
      } else {
        elementToSetToggleState.setAttribute(effectiveOptions.toggleProperty, '')
      }
    } else {  // class toggle
      elementToSetToggleState.classList.toggle(effectiveOptions.toggleProperty)
    }
  }

  element.addEventListener('click', onClick)

  return {
    destroy: () => {
      if (effectiveOptions.toggleMode === 'attribute') {
        elementToSetToggleState.removeAttribute(effectiveOptions.toggleProperty)
      } else {
        elementToSetToggleState.classList.remove(effectiveOptions.toggleProperty)
      }

      element.removeEventListener('click', onClick)
    }
  }
}