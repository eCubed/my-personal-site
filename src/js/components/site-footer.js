class SiteFooter extends HTMLElement {
  connectedCallback() {

    this.innerHTML = `
      <footer>
        This is the footer
      </footer>
    `;
  }
}

customElements.define("site-footer", SiteFooter);