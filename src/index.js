import html from './template.html';
import css from './styles.css';

const LINK_REGEX = /\[(?<textContent>[^\]]+)\]\((?<href>[^\)]+)\)/g;
class ComponentAnatomy extends window.HTMLElement {

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

  clear() {
    this.definitions = [];
    return this;
  }

  create(payload) {
    if (['x', 'y', 'term'].every(key => key in payload)) {
      this.definitions = this.definitions.concat(payload);
    }
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
  }

  _click({ offsetX, offsetY }) {
    if (!this.edit) return;
    const { offsetWidth, offsetHeight } = this._$pins;
    const [x, y] = [ offsetX / offsetWidth, offsetY / offsetHeight ].map(v => `${Math.round(v * 100)}%`);
    this.create({ x, y, term: this.placeholder });
  }

  _create({ x, y, term }) {
    const index = this._$list.children.length;
    this._createPin({ left: x, top: y }, index);
    this._createDescription(term, index);
  }

  _createDescription(term, index) {
    const $term = document.createElement('li');
    this._processContent(term, $term);
    this._attributes($term);
    $term.id = `item-${index}`;

    $term.addEventListener('mouseenter', () => this._mouseenter(index));
    $term.addEventListener('mouseleave', () => this._mouseleave(index));
    $term.addEventListener('blur', () => this._blur(index));

    this._$list.appendChild($term);
  }

  _processContent(content, parent) {
    let node = document.createTextNode(content);
    parent.appendChild(node);
    [...content.matchAll(LINK_REGEX)].reduce((pointer, match) => {
      const { length } = match[0];
      node = node.splitText(match.index - pointer);
      node = node.splitText(length);
      return match.index + length;
    }, 0);
    [...parent.childNodes].forEach(n => {
      const result = LINK_REGEX.exec(n.data);
      if (!result) return;
      const a = document.createElement('a');
      Object.assign(a, result.groups);
      n.parentNode.replaceChild(a, n);
    });
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
    this.definitions.forEach(this._create, this);
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
    } else if (Array.isArray(value)) {
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
      this.setAttribute('placeholder', value);
    } else {
      this.removeAttribute('placeholder');
    }
  }

  get orientation() {
    return this.getAttribute('orientation') || 'horizontal';
  }

  set orientation(value) {
    const orientations = ['horizontal', 'vertical'];
    if (value && orientations.includes(value)) {
      this.setAttribute('orientation', value);
    } else {
      this.removeAttribute('orientation');
    }
  }
}

window.customElements.define('component-anatomy', ComponentAnatomy);