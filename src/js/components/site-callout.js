class SiteCallout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --callout-bg: #f5f7ff;
          --callout-border: #8aa0ff;
          --callout-title-color: #1d2a57;
          --callout-padding: 1rem;
        }

        .box {
          background: var(--callout-bg);
          border: 1px solid var(--callout-border);
          border-left: 4px solid var(--callout-border);
          padding: var(--callout-padding);
          border-radius: 0.5rem;
        }

        .title {
          color: var(--callout-title-color);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .body {
          color: #222;
        }

        /* styles slotted children from the light DOM */
        ::slotted([slot="title"]) {
          margin: 0;
          font-size: 1.1rem;
        }

        ::slotted([slot="content"]) {
          margin: 0;
        }
      </style>

      <div class="box" part="box">
        <div class="title" part="title">
          <slot name="title"></slot>
        </div>
        <div class="body" part="body">
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('ui-callout', SiteCallout);