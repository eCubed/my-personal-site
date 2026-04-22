import { isFunction } from '../../base/primitive-utils.js'

export const DIALOG_DEFAULTS = {
  fadeDuration: 300, // Duration of fade in/out animations in milliseconds
  closeOnBackdropClick: true, // Whether clicking on the backdrop should close the dialog
  closeOnEscape: true, // Whether pressing the Escape key should close the dialog
  panelClass: '', // Additional CSS class(es) to apply to the dialog panel for custom styling
  hostClass: '', // Additional CSS class(es) to apply to the dialog host for custom styling
  backdropClass: '', // Additional CSS class(es) to apply to the backdrop for custom styling
  data: null // Optional data that can be passed to the dialog content for use within the dialog
}

export const openDialog = (dialogContentElement, options = {}) => {
  const effectiveOptions = { ...DIALOG_DEFAULTS, ...options }
  const { fadeDuration, closeOnBackdropClick, closeOnEscape, panelClass, hostClass, backdropClass, data } = effectiveOptions

  let closedResolve
  const closed = new Promise(resolve => {
    closedResolve = resolve;
  });

  let closedResult = null
  let hasClosed = false

  const afterClosedCallbacks = new Set()

  const host = document.createElement('div');
  host.className = 'ui-dialog-host';
  if (hostClass) {
    host.classList.add(...hostClass.split(/\s+/).filter(Boolean));
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'ui-dialog-backdrop';
  if (backdropClass) {
    backdrop.classList.add(...backdropClass.split(/\s+/).filter(Boolean));
  }

  const panel = document.createElement('div');
  panel.className = 'ui-dialog-panel';
  if (panelClass) {
    panel.classList.add(...panelClass.split(/\s+/).filter(Boolean));
  }

  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');

  host.style.setProperty('--ui-dialog-fade-duration', `${fadeDuration}ms`);
  backdrop.style.setProperty('--ui-dialog-fade-duration', `${fadeDuration}ms`);
  panel.style.setProperty('--ui-dialog-fade-duration', `${fadeDuration}ms`);

   const finalizeClose =() =>{
    cleanup()

    for (const callback of afterClosedCallbacks) {
      try {
        callback(closedResult);
      } catch (error) {
        console.error('Error in dialog afterClosed callback:', error);
      }
    }

    afterClosedCallbacks.clear();
    closedResolve(closedResult);
  }

  const close = (result) => {
    if (hasClosed) return

    hasClosed = true
    closedResult = result

    host.setAttribute('data-closing', '')
    // This function will handle closing the dialog, including any fade out animations and cleanup
    // After the dialog is fully closed, we will call the afterCloseCallback if it exists, and pass any result data from the dialog to it
    
    window.setTimeout(() =>{
      finalizeClose()
    }, fadeDuration)

    for(const callback of afterClosedCallbacks) {
      callback?.(dialogContentElement.result)
    }
  }

  const dialogRef ={
    destroy: () => {
      // Put a bunch of remove event listeners and cleanup logic here, and then call close() to trigger the afterClosed callback
      close()

    },
    afterClosed: (callback) => {
    // This function can be used to register a callback that will be called after the dialog is closed
      if(!isFunction(callback)) {
        throw new Error('Callback must be a function');
      }

      if (hasClosed){
        callback(closedResult);
        return () => {}
      }

      afterClosedCallbacks.add(callback)

      return () => {
        afterClosedCallbacks.delete(callback)
      }
    },
    close,
    closed,
    isClosed: () => hasClosed,
    elements: {
      host,
      backdrop,
      panel,
    }
  }
  
  dialogContentElement.dialogRef = dialogRef
  dialogContentElement.dialogData = data

  panel.append(dialogContentElement)
  host.append(backdrop, panel);
  document.body.append(host);
  host.getBoundingClientRect() // Force reflow to ensure the dialog is in the DOM and styles are applied before starting the fade-in animation
  host.setAttribute('data-open', '')
  
  const originalBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const cleanup = () => {
    document.removeEventListener('keydown', onDocumentKeyDown);
    backdrop.removeEventListener('click', onBackdropClick);
    document.body.style.overflow = originalBodyOverflow;

    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  }

 

  const onBackdropClick = () => {
    if (closeOnBackdropClick) {
      close(undefined)
    }
  }

  const onDocumentKeyDown = (event) => {
    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault()
      close(undefined)
    }
  }

  if (closeOnBackdropClick) {
    backdrop.addEventListener('click', onBackdropClick)
  }

  if (closeOnEscape) {
    document.addEventListener('keydown', onDocumentKeyDown)
  }


  return dialogRef
}