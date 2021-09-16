import html from './template.html';
import css from './styles.css';
class ComponentAnatomy extends HTMLElement {

  /** Lifecycle methods */

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style type="text/css">${css}</style>${html}`;

    this._$pins = this.shadowRoot.getElementById('pins');
    this._$list = this.shadowRoot.getElementById('list');
  }

  static get observedAttributes() { 
    return [ 'definitions', 'edit' ]
  }

  attributeChangedCallback(attrName) {
    if (attrName === 'definitions') this._render();
    if (attrName === 'edit') this._edit();
  }

  connectedCallback() {
    this._$pins.addEventListener('click' , ev => this._click(ev));
  }

  /** Public methods */

  create({ x, y, term }) {
    if (!x || !y || !term) return;
    const index = this._$list.children.length;
    this._createPin({ left: x, top: y }, index);
    this._createDescription(term, index);
    return this;
  }

  remove(index) {
    this.definitions = this.definitions.filter((def, i) => i !== index);
    return this;
  }

  update(index, payload) {
    this.definitions = this.definitions.map((def, i) => i === index ? Object.assign(def, payload) : def);
    return this;
  }

  /** Private methods */

  _attributes(item) {
    if (this.edit) {
      item.setAttribute('contentEditable', '');
    } else {
      item.removeAttribute('contentEditable');
    }
  }

  _blur(index) {
    const { textContent } = this._$list.children[index];
    if (textContent.trim()) {
      this.update(index, { term: textContent });
    } else {
      this.remove(index);
    }
  }

  _clear() {
    this._$pins.innerHTML = '';
    this._$list.innerHTML = '';
    return this;
  }

  _click({ offsetX, offsetY }) {
    if (!this.edit) return;
    const { offsetWidth, offsetHeight } = this._$pins;
    const [x, y] = [ offsetX / offsetWidth, offsetY / offsetHeight ].map(v => `${Math.round(v * 100)}%`);
    this.definitions = this.definitions.concat({ x, y, term: this.placeholder });
  }

  _createDescription(term, index) {
    const $term = document.createElement('li');
    $term.textContent = term;
    this._attributes($term);
    $term.id = `item-${index}`;

    $term.addEventListener('mouseenter', () => this._mouseenter(index));
    $term.addEventListener('mouseleave', () => this._mouseleave(index));
    $term.addEventListener('blur', () => this._blur(index));

    this._$list.appendChild($term);
  }

  _createPin(style, index) {
    const $pin = document.createElement('li');
    Object.assign($pin.style, style);
    $pin.setAttribute('aria-describedby', `item-${index}`);
    $pin.tabIndex = 0;
    this._$pins.appendChild($pin);
  }

  _edit() {
    [...this._$list.children].forEach(this._attributes, this);
  }

  _mouseenter(index) {
    this._$pins.children[index].setAttribute('aria-current', '');
  }

  _mouseleave(index) {
    this._$pins.children[index].removeAttribute('aria-current');
  }
  
  _render() {
    this._clear();
    this.definitions.forEach(this.create, this);
  }

  /** Getters/Setters */

  get definitions() {
    try {
      const result = JSON.parse(window.atob(this.getAttribute('definitions')));
      return [].concat(result).filter(Boolean);
    } catch (err) {
      return [];
    };
  }

  set definitions(value) {
    if (!value || !value.length) {
      this.removeAttribute('definitions');
    }

    if (typeof value === 'object') {
      this.setAttribute('definitions', window.btoa(JSON.stringify(value)));
    }
  }

  get edit() {
    return this.hasAttribute('edit');
  }

  set edit(value) {
    if (value) {
      this.setAttribute('edit', '');
    } else {
      this.removeAttribute('edit');
    }
  }

  get placeholder() {
    return this.getAttribute('placeholder') || 'placeholder';
  }

  set placeholder(value) {
    if (value) {
      this.setAttribute('placeholder', '');
    } else {
      this.removeAttribute('placeholder');
    }
  }

  get orientation() {
    return this.getAttribute('orientation') || 'horizontal';
  }

  set orientation(value) {
    if (value) {
      this.setAttribute('orientation', '');
    } else {
      this.removeAttribute('orientation');
    }
  }
}

window.customElements.define('component-anatomy', ComponentAnatomy);