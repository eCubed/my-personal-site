import { isElement } from "../base/element-utils"

export const HIGHTLIGHT_DEFAULTS = {
  background: 'yellow',
  fadeDuration: 500
}

export const applyHighlight = (el, highlightOptions = {}) => {
  if (!isElement(el))
    throw new Error('Must be an element to highlight')

  const appliedOptions = {...HIGHTLIGHT_DEFAULTS, ...highlightOptions}
  const originalBackgroundColor = el.style.backgroundColor

  const onMouseOver = (e) => {
    e.target.style.backgroundColor = appliedOptions.background
    e.target.style.transition = `background-color ${appliedOptions.fadeDuration}ms ease-in-out`
  }

  const onMouseOut = (e) => {
    console.log('mouse out')
    e.target.style.backgroundColor = originalBackgroundColor
  }

  el.addEventListener('mouseover', onMouseOver)
  el.addEventListener('mouseout', onMouseOut)
  
  return {
    destroy: () => {
      el.target.style.backgroundColor = originalBackgroundColor
      el.removeEventListener('mouseover', onMouseOver)
      el.removeEventListener('mouseout', onMouseOut)
    }
  }
}