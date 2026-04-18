import { isElement } from "../base/element-utils"
import { isFunction } from "../base/primitive-utils"

export const CLICK_OUTSIDE_DEFAULTS = {
  ignore: [],
  onOutsideClick: null
}



export const applyClickOutside = (target, options) => {
  const effectiveOptions = { ...CLICK_OUTSIDE_DEFAULTS, ...options }

  if(!isElement(target))
    throw new Error('Target must be element')
  if(!isFunction(effectiveOptions.onOutsideClick))
    throw new Error('Callback must be function')

  function isInsideTargetOrIgnoredElements(element) {
    return target.contains(element) || effectiveOptions.ignore.some(ignored => ignored.contains(element))
  }


  const onDocumentClick = (e) => {
    const innermostTarget = e.composedPath()[0]
    if (isInsideTargetOrIgnoredElements(innermostTarget))
      return
    
    effectiveOptions.onOutsideClick(target, innermostTarget)
  }

  document.addEventListener('click', onDocumentClick)

  return {
    destroy: () => {
      document.removeEventListener('click', onDocumentClick)
    }
  }

}