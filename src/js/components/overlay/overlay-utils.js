import { isElement, surround } from '../../base/element-utils'

export const createOverlayHost = (target) => {
  const host = document.createElement('div')
  host.className = 'overlay-host'

  
  const targetStyles = getComputedStyle(target)
  host.style.borderTopLeftRadius = targetStyles.borderTopLeftRadius;
  host.style.borderTopRightRadius = targetStyles.borderTopRightRadius;
  host.style.borderBottomLeftRadius = targetStyles.borderBottomLeftRadius;
  host.style.borderBottomRightRadius = targetStyles.borderBottomRightRadius;

  const display = targetStyles.display;
   
  if (display === 'inline' || display === 'inline-block' || display === 'inline-flex') {
    host.classList.add('overlay-host--inline');
  } else {
    host.classList.add('overlay-host--block');
  }

  /*
  const parent = target.parentNode
  if (!parent)
    throw new Error('Target element must already be attached to the DOM.')

  parent.insertBefore(host, target)
  host.appendChild(target)
  */
  surround(target, host)
  return host
}

export const getOverlayHost = (target) => {
  const parent = target.parentNode
  
  if (parent?.classList.contains('overlay-host'))
    return parent
  else
    return null
}

export const addOverlay = async (target, options = {}) => {
  if (!isElement(target))
    throw new Error('addOverlay(target) requires a DOM element')
  const resolvedOptions = normalizeOverlayOptions(options)
  console.log(`RO: ${JSON.stringify(resolvedOptions)}`)
  let host = getOverlayHost(target)

  if (!host)
    host = createOverlayHost(target)

  const styles = getComputedStyle(target);

  host.style.borderTopLeftRadius = styles.borderTopLeftRadius;
  host.style.borderTopRightRadius = styles.borderTopRightRadius;
  host.style.borderBottomLeftRadius = styles.borderBottomLeftRadius;
  host.style.borderBottomRightRadius = styles.borderBottomRightRadius;

  let overlay = host.querySelector(':scope > ui-overlay')

  if (!overlay) {
    overlay = document.createElement('ui-overlay');
    host.appendChild(overlay);
  }
  overlay.duration = resolvedOptions.fadeDuration
  overlay.setAttribute('position', resolvedOptions.position)
  overlay.backgroundColor = resolvedOptions.backgroundColor
  overlay.style.setProperty('--ui-overlay-offset', resolvedOptions.offset)
  overlay.setContent(resolvedOptions.content)
 
  await overlay.show()
  return overlay
}

const cleanupHostIfEmpty = (host, target)  => {
  if (host.childElementCount === 1 && host.firstElementChild === target) {
    const parent = host.parentNode
    if (!parent)
      return
    parent.insertBefore(target, host)
    host.remove()    
  }
}

export const removeOverlay = async (target) => {
  if (!isElement(target))
    throw new Error('removeOverlay(target) requires a DOM element')

  const host = getOverlayHost(target)
  if (!host) return // do nothing

  const overlay = host.querySelector(':scope > ui-overlay')
  if (!overlay) {
    cleanupHostIfEmpty(host, target)
    return
  }

  await overlay.hide()
  overlay.remove()
  cleanupHostIfEmpty(host, target)
  
}

const DEFAULT_OVERLAY_OPTIONS = {
  fadeDuration: 500,
  backgroundColor: 'rgba(128, 128, 128, 0.35)',
  position: 'center',
  offset: '0.5rem'
}

const normalizeOverlayOptions = (options = {}) => { 
  return {...DEFAULT_OVERLAY_OPTIONS, ...options} 
}