import { isElement } from '../base/element-utils'
import { isFunction } from '../base/primitive-utils.js'
import { applyPopup } from './popup.js'
export const CONTEXT_MENU_DEFAULTS = {
  menu: null,
  provideContext: null, // function that returns context object to be passed to onAction callback
  onAction: null, // callback that receives context and action when a menu item is clicked
}

export const applyContextMenu = (target, options = {}) => {
  const effectiveOptions = {...CONTEXT_MENU_DEFAULTS, ...options }
  const { menu } = effectiveOptions

  let currentContext = null

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
    currentContext = effectiveOptions.provideContext ? effectiveOptions.provideContext(event) : null
    popupRef.openAt(event.clientX, event.clientY)
  }

  const close = () => {
    popupRef.close()
  }

  target.addEventListener('contextmenu', handleContextMenu)

  const menuClickHandler = (event) => {
    
    const elementWithAction = event.target.closest('[data-action]')   
    const action = elementWithAction ? elementWithAction.dataset.action : null
    if (action && isFunction(effectiveOptions.onAction)) {
      effectiveOptions.onAction({currentContext, action})
      close()
    }
  }

  menu.addEventListener('click', menuClickHandler)
  
  return {
    destroy: () => {
      target.removeEventListener('contextmenu', handleContextMenu)
      menu.removeEventListener('click', menuClickHandler)
      popupRef.destroy()
    },
    close,
  }

}