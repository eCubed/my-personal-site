
class SiteNav extends HTMLElement {

  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this._title = 'Menu'
    this._items = []
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attributeChangedCallback')
    if (oldValue === newValue) return;

    if (name === 'title') {
      this._title = newValue || 'Menu';
      this.render();
    }
  }

  connectedCallback() {
    this.render()
    
  }

  get items() {
    return this._items
  }

  set items(value) {
    this._items = Array.isArray(value) ? value : []
    this.render()
  }

  /*
  attachEvents() {
    this.shadowRoot.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', (e) => {
        e.preventDefault();

        const index = Number(li.dataset.index);
        const item = this._items[index];

        this.dispatchEvent(
          new CustomEvent('item-click', {
            detail: {
              item,
              index
            },
            bubbles: true,
            composed: true
          })
        );
      });
    });
  }
*/
  render() {

    const itemsHTML = this._items.map((item, index) => 
      `
        <li data-index="${index}">
          <a href="${item.href ?? '#'}">${item.label ?? ''}</a>
        </li>
      `
    )
    .join('')

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
        }

        nav.site-nav {
          background: #1f2937;
          color: white;
          height: 100%;
          padding: 0.5em;
          box-sizing: border-box;

          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .title {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 12px;
        }

        ul {
          display: flex;
          flex-direction: row;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        li:hover {
          background: #374151;
        }

        a {
          color: white;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
      
      <nav class="site-nav" aria-label="Primary">
        <a class="site-nav__brand" href="/">${this._title}</a>

        <ul class="site-nav__links">
          ${itemsHTML}
        </ul>
      </nav>
    `

    //this.attachEvents()
  }
}

customElements.define("site-nav", SiteNav);