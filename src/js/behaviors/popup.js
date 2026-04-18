import { isElement } from '../base/element-utils.js'
import { isFunction } from '../base/primitive-utils.js'
import { applyClickOutside } from './click-outside.js'
import { applyDismissOnEscape } from './dismiss-on-escape.js'


export const popupDefaults = {
  trigger: 'click',
  createPopupElement: null,
  position: 'bottom', // top, left, right
  fadeDuration: 300,
  ignore: []
}


export const applyPopup = (host, options = {}) => {
  console.log(`Applying popup for host ${host.id}`)
  if (!isElement(host))
    throw new Error('Host must be an element')

  if (!isFunction(options.createPopupElement))
    throw new Error('createPopupElement must be an async function')

  const effectiveOptions = { ...popupDefaults, ...options }

  let isOpen = false
  const currentPopup = effectiveOptions.createPopupElement()
  if (!isElement(currentPopup))
    throw new Error('elementToPopup must be an element')
  
  currentPopup.hidden = true
  currentPopup.style.position = 'absolute'
  currentPopup.style.opacity = 0
  currentPopup.style.transition = `opacity ${effectiveOptions.fadeDuration}ms ease-in-out`
  currentPopup.style.zIndex = 9999
  document.body.appendChild(currentPopup)
  
  const clickOutsideBehavior = applyClickOutside(currentPopup, {
    onOutsideClick: () => {
      close()
    },
    ignore: [host, ...effectiveOptions.ignore]
  })

  const dismissOnEscapeBehavior = applyDismissOnEscape({
   onEscape: () => {
    close()
   } 
  })

  const onHostClick = () => {
    
    if(isOpen) {
      close()
      isOpen = false
    } else {
      open()
      isOpen = true
    }
  }
  
  host.addEventListener(effectiveOptions.trigger, onHostClick)
 
  const open = () => {
    
    currentPopup.hidden = false    
    const hostRect = host.getBoundingClientRect()
    const popupRect = currentPopup.getBoundingClientRect()
    switch (effectiveOptions.position) {
      case 'top':
        currentPopup.style.left = `${hostRect.left}px`
        currentPopup.style.top = `${hostRect.top - popupRect.height}px`
        break
      case 'left':
        currentPopup.style.left = `${hostRect.left - popupRect.width}px`
        currentPopup.style.top = `${hostRect.top}px`
        break
      case 'right':
        currentPopup.style.left = `${hostRect.right}px`
        currentPopup.style.top = `${hostRect.top}px`
        break 
      case 'bottom':
        currentPopup.style.left = `${hostRect.left}px`
        currentPopup.style.top = `${hostRect.bottom}px`
        break
    }
    
    currentPopup.getBoundingClientRect() // Force reflow
    currentPopup.style.opacity = 1
    isOpen = true
    
    currentPopup.addEventListener('transitionend', () => {
      if (currentPopup.style.opacity === '0') {
        currentPopup.hidden = true
        isOpen = false
      }
    })
  }

  const close = () => {
    
    if (currentPopup) {
      currentPopup.style.opacity = 0 
      isOpen = false
    }
  }

  return {
    destroy: () => {
      host.removeEventListener(effectiveOptions.trigger, onHostClick)
      clickOutsideBehavior?.destroy()
      dismissOnEscapeBehavior?.destroy()
    },
    open: open,
    close: close,
    isOpen: () => isOpen
  }
}