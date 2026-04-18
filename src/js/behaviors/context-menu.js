import { isElement } from '../base/element-utils'
import { applyClickOutside } from './click-outside.js'
export const CONTEXT_MENU_DEFAULTS = {
  menu: null,
  onOpen: null,
  onClose: null
}

export const applyContextMenu = (target, options = {}) => {
  const effectiveOptions = {...CONTEXT_MENU_DEFAULTS, ...options }
  const { menu, onOpen, onClose } = effectiveOptions

  if(!isElement(target))
    throw new Error('Target must be a DOM element')

  if(!isElement(effectiveOptions.menu))
    throw new Error('Menu must be a DOM element')

  let isOpen = false

  const ensureMenuInDOM = () => {
    if (!document.body.contains(menu)) {
      document.body.appendChild(menu)
    }
  }

  ensureMenuInDOM()

  const clickOutsideRef = applyClickOutside(menu, {
    onOutsideClick: () => {
      if (isOpen) close()
    },
    ignore: [menu]
  })

  const openAt = (x, y, triggerEvent) => {
    menu.hidden = false
    menu.style.position = 'fixed'
    menu.style.visibility = 'hidden'

    const rect = menu.getBoundingClientRect()
    console.log('Menu dimensions:', rect.width, rect.height)

    let left = x
    let top = y

    if (left + rect.width > window.innerWidth) {
      left = window.innerWidth - rect.width
    }

    if (top + rect.height > window.innerHeight) {
      top = window.innerHeight - rect.height
    }
    
    menu.style.left = `${Math.max(0, left)}px`
    menu.style.top = `${Math.max(0, top)}px`
    isOpen = true
    menu.style.visibility = 'visible'
    
    onOpen?.({left, top, triggerEvent}) 
  }

  const close = () => {
    if (!isOpen) return

    menu.hidden = true
    isOpen = false
    onClose?.() 
  }

  const handleContextMenu = (event) => {
    event.preventDefault()
    console.log('Context menu triggered at', event.clientX, event.clientY)
    openAt(event.clientX, event.clientY, event)
  }

  const handleDocumentClick = (event) => {
    /*
    if (!isOpen) return
    if (!menu.contains(event.target)) return
    close()
    */
  }

  const handleKeyDown = (event) => {
    if (!isOpen) return
    if (event.key === 'Escape') {
      close()
    }
  }

  target.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeyDown)

  menu.hidden = true
  
  return {
    destroy: () => {
      target.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleKeyDown)
      clickOutsideRef?.destroy()
    },
    openAt,
    close
  }

}