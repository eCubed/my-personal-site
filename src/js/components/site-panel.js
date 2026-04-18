class SitePanel extends HTMLElement {
  #title

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#title = 'Default Title'
  }

  static get observedAttributes() {
    return ['title'];
  }

  set title (value) {
    console.log('set title function')
    this.#title = value
  }

  get title() {
    return this.#title
  }
  
  // like ngOnChanges
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return

    if (name === 'title') {
      this.title = newValue
    }
  }

  
  // like ngOnInit
  connectedCallback() {
    this.render()
  }

  render() {
    const styleText = `

      :host {
        --heading-background-color: #009900;
        --heading-color: #efefef;
        --content-background-color: #dfdfdf;
        --panel-border-radius: 0.5em;
        
        display: inline-flex;
        flex-direction: column;
        gap: 0;
        border-radius: var(--panel-border-radius);
        overflow: hidden;        
      }

      div.title {
        box-sizing: border-box;
        padding: 0.5rem;
        margin-bottom: 0;
        font-weight: bold;
        background-color: var(--heading-background-color);
        color: var(--heading-color);
      }

      div.container {
        padding: 0.5em;
        background-color: var(--content-background-color);
      }
    `
    
    this.shadowRoot.innerHTML = `
      <style>
        ${styleText}
      </style>
      <div class="title">${this.#title}</div>
      <div class="container" part="container">
        <slot></slot>
      </div>
    `

    /*
    const contentContainer = document.createElement('div')
    contentContainer.className = 'container'
    contentContainer.innerHTML = `<slot></slot>`
    panelElement.appendChild(contentContainer)

    this.shadowRoot.appendChild(panelElement)
    */
  }

  
}

customElements.define('site-panel', SitePanel)