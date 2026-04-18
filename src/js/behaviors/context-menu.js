import { isElement } from '../base/element-utils'
import { applyPopup } from './popup.js'
export const CONTEXT_MENU_DEFAULTS = {
  menu: null,
}

export const applyContextMenu = (target, options = {}) => {
  const effectiveOptions = {...CONTEXT_MENU_DEFAULTS, ...options }
  const { menu } = effectiveOptions

  if(!isElement(target))
    throw new Error('Target must be a DOM element')

  if(!isElement(effectiveOptions.menu))
    throw new Error('Menu must be a DOM element')

  const ensureMenuInDOM = () => {
    if (!document.body.contains(menu)) {
      document.body.appendChild(menu)
    }
  }

  ensureMenuInDOM()

  const popupRef = applyPopup(menu, {
    trigger: 'click',
    ignore: [menu]
  })

  const handleContextMenu = (event) => {
    event.preventDefault()
    popupRef.openAt(event.clientX, event.clientY)
  }

  target.addEventListener('contextmenu', handleContextMenu)
  
  return {
    destroy: () => {
      target.removeEventListener('contextmenu', handleContextMenu)
      popupRef.destroy()
    }
  }

}