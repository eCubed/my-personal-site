import { applyPopup } from '../behaviors/popup'

export class EditablePopupText extends HTMLElement {
 
  #popupBehavior = null
  #text = ''
  #displayTextElement = null

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: row;
          gap: 0.5em;
        }

      </style>
      
      <div id="display-text"></div>
      <button type="button" id="popup-trigger-for-edit">Edit</button>
    `
    this.#cacheElements()
    this.#attachEvents()

  }

  static get observedAttributes() {
    return ['text']
  }

  get text() {
    return this.#text
  }

  set text(value) {
    console.log('Setting text to:', value)
    this.#text = value
    this.#displayTextElement.innerText = this.#text
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log(`Attribute changed: ${name} from "${oldValue}" to "${newValue}"`)
    if (name === 'text') {
      this.text = newValue
    }
  }

  connectedCallback() {
  }

  #createEditablePopup() {
    const popup = document.createElement('div')
    popup.id = `editable-popup-${Date.now()}`
    popup.classList.add('editable-popup')
    
    const input = document.createElement('input')
    input.type = 'text'
    input.value = this.#text.trim()
    popup.appendChild(input)

    const saveButton = document.createElement('button')
    saveButton.innerText = 'Save'
    saveButton.addEventListener('click', () => {
      this.text = input.value
      this.#popupBehavior.close()
    })    
    popup.appendChild(saveButton)
    return popup
  }

  #cacheElements(){
    this.#displayTextElement = this.shadowRoot.querySelector('#display-text')
  }

  #attachEvents() {
    const popup = this.#createEditablePopup()
    const trigger = this.shadowRoot.querySelector('#popup-trigger-for-edit')
    this.#popupBehavior = applyPopup(popup, {
      trigger: 'click',
      anchor: trigger,
      createPopupElement: () => this.#createEditablePopup(),
      position: 'bottom'
    })
  }

  disconnectedCallback() {
    this.#popupBehavior?.destroy()
  }
}

customElements.define('site-editable-popup-text', EditablePopupText)