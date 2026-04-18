class SiteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 16px;
          background: #eee;
        }
      </style>

      <div class="card">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('site-card', SiteCard);