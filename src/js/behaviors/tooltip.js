import { isElement, surround } from "../base/element-utils"

export const TOOLTIP_DEFAULTS = {
  fadeDuration: 500,
  offset: '0.5em',
  position: 'top'
}

function setTooltipPosition(tooltip, position, offset) {
  if (position === 'bottom') {
    tooltip.style.bottom = `-${offset}`
    tooltip.style.left = '0'
    tooltip.style.transform = 'translateY(100%)'
  } else if (position === 'right') {
    tooltip.style.top = '0'
    tooltip.style.right = `-${offset}`
    tooltip.style.transform = 'translateX(100%)'
  } else if (position === 'left') {
    tooltip.style.top = '0'
    tooltip.style.left = `-${offset}`
    tooltip.style.transform = 'translateX(-100%)'
  }
   else {
    tooltip.style.top = `-${offset}`
    tooltip.style.left = '0'
    tooltip.style.transform = 'translateY(-100%)'
  }
}


export const applyTooltip = (host, tooltip, tooltipOptions = {}) => {
  if(!isElement(host) || !isElement(tooltip))
    throw new Error('Both host and tooltip must be elements')

  const appliedOptions = {...TOOLTIP_DEFAULTS, ...tooltipOptions }

  const surroundDiv = document.createElement('div')
  
  const { display: hostDisplay, cursor: originalHostCursor } = getComputedStyle(host)
  surroundDiv.style.display = hostDisplay
  surroundDiv.style.position = 'relative'
  surround(host, surroundDiv)

  tooltip.style.position = 'absolute'
  setTooltipPosition(tooltip, appliedOptions.position, appliedOptions.offset)
  tooltip.style.opacity = 0
  tooltip.style.transition = `opacity ${appliedOptions.fadeDuration}ms ease-in-out`

  const onMouseOver = () => {
    surroundDiv.appendChild(tooltip)
    tooltip.getBoundingClientRect()
    tooltip.style.opacity = 1 
    host.style.cursor = 'pointer'
  }

  const onMouseOut = () => {
    tooltip.style.opacity = 0
    host.style.cursor = originalHostCursor
  }

  const onTransitionEnd = (e) => {
    if (e.propertyName === 'opacity' && tooltip.style.opacity === 0) {
      tooltip.remove()
    }
  }

  host.addEventListener('mouseover', onMouseOver)
  host.addEventListener('mouseout', onMouseOut)
  tooltip.addEventListener('transitionend', onTransitionEnd)

  return {
    destroy: () => {
      host.removeEventListener('mouseover', onMouseOver)
      host.removeEventListener('mouseout', onMouseOut)
      tooltip.removeEventListener('transitionend', onTransitionEnd)
      tooltip.remove()
      host.style.cursor = originalHostCursor
    }
  }
}
