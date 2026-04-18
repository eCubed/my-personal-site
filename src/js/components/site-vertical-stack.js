class SiteVerticalStack extends HTMLElement {
  #gap
  #padding
  #rootStyleText
  
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#gap = '1em'
    this.#padding = '1em'
  }

  static get observedAttributes() {
    return ['gap', 'padding']
  }

  constructRootStyleText() {
    this.#rootStyleText = `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: ${this.#gap};
          padding: ${this.#padding} !important;

          & > * {
            margin-bottom: 0;
          }
        }
      </style>
    `
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attribute changed callback site vertical stack')
    if (oldValue === newValue) return

    if (name === 'gap') {
      this.#gap = newValue || '1em';
      this.render()
    }

    if (name === 'padding') {
      this.#padding = newValue || '1em';
    }
  }


  connectedCallback() {
    this.render()
  }

  render() {
    this.constructRootStyleText()
    this.shadowRoot.innerHTML = `
      ${this.#rootStyleText}
      <slot></slot>
    `
  }
}

customElements.define('site-vertical-stack', SiteVerticalStack)