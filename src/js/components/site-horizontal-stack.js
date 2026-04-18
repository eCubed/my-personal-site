class SiteHorizontalStack extends HTMLElement {
  #gap
  #padding
  #justifyContent
  #rootStyleText
  
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#gap = '1em'
    this.#padding = '1em'
    this.#justifyContent = 'flex-start'
  }

  static get observedAttributes() {
    return ['gap', 'padding', 'justify-content']
  }

  constructRootStyleText() {
    this.#rootStyleText = `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          gap: ${this.#gap};
          padding: ${this.#padding} !important;
          justify-content: ${this.#justifyContent};

          & > * {
            margin-bottom: 0;
          }
        }
      </style>
    `
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attribute changed callback site horizontal stack')
    if (oldValue === newValue) return

    if (name === 'gap') {
      this.#gap = newValue || '1em';
      this.render()
    }

    if (name === 'padding') {
      this.#padding = newValue || '1em';
    }

    if (name === 'justify-content') {
      this.#justifyContent = newValue || 'flex-start'
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

customElements.define('site-horizontal-stack', SiteHorizontalStack)