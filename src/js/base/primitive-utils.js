export const isObject = (val) => typeof val === 'object' && val !== null && !Array.isArray(val)

export const isFunction = (func) => (Object.prototype.toString.call(func) === '[object Function]')

export const equals = (a, b, comparer) => {
  if(!isObject(a) || !isObject(b))
    throw new Error('Both a and b need to be objects')

  if(!isFunction(truthTest))
    throw new Error('Truth test must be a function')

  return comparer(a, b)
}

export const all = (array, truthTest) => {
  if(!Array.isArray(array))
    throw new Error('Array is required')

  if(!isFunction(truthTest))
    throw new Error('Truth test must be a function')

  for(let i = 0; i < array.length; i++) {
    if (!truthTest(array[i]))
      return false
  }

  return true
}

export const any = (array, truthTest) => {
  if(!Array.isArray(array))
    throw new Error('Array is required')

  if(!isFunction(truthTest))
    throw new Error('Truth test must be a function')

  for(let i = 0; i < array.length; i++) {
    if (truthTest(array[i]))
      return true
  }

  return false
}

export const none = (array, truthTest) => {
  if(!Array.isArray(array))
    throw new Error('Array is required')

  if(!isFunction(truthTest))
    throw new Error('Truth test must be a function')

  for(let i = 0; i < array.length; i++) {
    if (truthTest(array[i]))
      return false
  }

  return true
}