
export const isElement = (node) => {
  return node instanceof Element
}

export const surround = (target, newContainer) => {
  if (!isElement(target) || !isElement(newContainer))
    throw new Error('Both target and newContainer must be elements')

  const parentOfTarget = target.parentNode
  if (!parentOfTarget)
    throw new Error('target must be placed in the DOM')

  parentOfTarget.insertBefore(newContainer, target)
  newContainer.appendChild(target)

}