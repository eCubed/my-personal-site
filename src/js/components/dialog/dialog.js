export const DIALOG_DEFAULTS = {
  fadeDuration: 300, // Duration of fade in/out animations in milliseconds
  closeOnOverlayClick: true, // Whether clicking on the overlay should close the dialog
  closeOnEscape: true, // Whether pressing the Escape key should close the dialog
}

export const openDialog = (dialogContentElement, options = {}) => {
  const effectiveOptions = { ...DIALOG_DEFAULTS, ...options }
  const { fadeDuration, closeOnOverlayClick, closeOnEscape } = effectiveOptions

  let afterCloseCallback = null



  const afterClosed = (callback) => {
    // This function can be used to register a callback that will be called after the dialog is closed
    afterCloseCallback = callback
    // We will call afterCloseCallback?.(dialogContentElement.result) when the dialog is closed, and we can pass any relevant result data from the dialog to the callback
  }

  const close = () => {
    // This function will handle closing the dialog, including any fade out animations and cleanup
    // After the dialog is fully closed, we will call the afterCloseCallback if it exists, and pass any result data from the dialog to it
    
     afterCloseCallback?.(dialogContentElement.result)
  }
    
  return {
    destroy: () => {
    },
    afterClosed,
    close
  }
}