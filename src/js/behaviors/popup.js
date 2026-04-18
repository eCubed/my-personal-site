import { isElement } from '../base/element-utils.js'
import { applyClickOutside } from './click-outside.js'
import { applyDismissOnEscape } from './dismiss-on-escape.js'


export const popupDefaults = {
  trigger: 'click',
  anchor: null,
  position: 'bottom', // top, left, right - default is bottom - applies when anchor is provided
  x: 0, // used when anchor is proveded - absolute positioning based on viewport
  y: 0, // used when anchor is proveded - absolute positioning based on viewport
  fadeDuration: 300,
  ignore: []
}


export const applyPopup = (popupElement, options = {}) => {  
  const effectiveOptions = { ...popupDefaults, ...options }

  if (!isElement(popupElement))
    throw new Error('Popup element must be a DOM element')

  if (effectiveOptions.anchor && !isElement(effectiveOptions.anchor))
    throw new Error('Anchor must be a DOM element')
  
  let isOpen = false
  
  popupElement.hidden = true
  popupElement.style.position = 'absolute'
  popupElement.style.opacity = 0
  popupElement.style.transition = `opacity ${effectiveOptions.fadeDuration}ms ease-in-out`
  popupElement.style.zIndex = 9999
  document.body.appendChild(popupElement)

  popupElement.addEventListener('transitionend', () => {
  if (popupElement.style.opacity === '0') {
    popupElement.hidden = true
      isOpen = false
    }
  })

  const effectiveIgnoreList = effectiveOptions.anchor ? [effectiveOptions.anchor, ...effectiveOptions.ignore] : effectiveOptions.ignore
  
  const clickOutsideBehavior = applyClickOutside(popupElement, {
    onOutsideClick: () => {
      close()
    },
    ignore: effectiveIgnoreList
  })

  const dismissOnEscapeBehavior = applyDismissOnEscape({
   onEscape: () => {
    close()
   } 
  })

  const open = () => {
    
    popupElement.hidden = false    
    const hostRect = effectiveOptions.anchor.getBoundingClientRect()
    const popupRect = popupElement.getBoundingClientRect()
    switch (effectiveOptions.position) {
      case 'top':
        popupElement.style.left = `${hostRect.left}px`
        popupElement.style.top = `${hostRect.top - popupRect.height}px`
        break
      case 'left':
        popupElement.style.left = `${hostRect.left - popupRect.width}px`
        popupElement.style.top = `${hostRect.top}px`
        break
      case 'right':
        popupElement.style.left = `${hostRect.right}px`
        popupElement.style.top = `${hostRect.top}px`
        break 
      case 'bottom':
        popupElement.style.left = `${hostRect.left}px`
        popupElement.style.top = `${hostRect.bottom}px`
        break
    }
    
    popupElement.getBoundingClientRect() // Force reflow
    popupElement.style.opacity = 1
    isOpen = true
    
   
  }

  const openAt = (x, y) => {
    
    popupElement.hidden = false
    popupElement.style.position = 'fixed'
    popupElement.style.visibility = 'hidden'
    popupElement.getBoundingClientRect() // Force reflow
    popupElement.style.opacity = 1

    const rect = popupElement.getBoundingClientRect()
    console.log('Menu dimensions:', rect.width, rect.height)

    let left = x
    let top = y

    if (left + rect.width > window.innerWidth) {
      left = window.innerWidth - rect.width
    }

    if (top + rect.height > window.innerHeight) {
      top = window.innerHeight - rect.height
    }
    
    popupElement.style.left = `${Math.max(0, left)}px`
    popupElement.style.top = `${Math.max(0, top)}px`
    isOpen = true
    popupElement.style.visibility = 'visible'
  }

  const close = () => {
    
    if (popupElement) {
      popupElement.style.opacity = 0 
      isOpen = false
    }
  }

  
  const onHostClick = () => {
    
    if(isOpen) {
      close()
      isOpen = false
    } else {
      open()
      isOpen = true
    }
  }
  
  effectiveOptions.anchor?.addEventListener(effectiveOptions.trigger, onHostClick)
 
  return {
    destroy: () => {
      effectiveOptions.anchor.removeEventListener(effectiveOptions.trigger, onHostClick)
      clickOutsideBehavior?.destroy()
      dismissOnEscapeBehavior?.destroy()
    },
    open,
    openAt,
    close,
    isOpen: () => isOpen
  }
}