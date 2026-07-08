
export class SentenceNavigator {
  constructor(sentences) {
    this.sentences = sentences;
    this.index = sentences.length ? 0 : -1;
    this.onChange = null; 
    this._boundHandler = this._handleKeydown.bind(this);
  }

  attach() {
    document.addEventListener("keydown", this._boundHandler, true);
  }

  detach() {
    document.removeEventListener("keydown", this._boundHandler, true);
  }

  setSentences(sentences, keepIndex = false) {
    this.sentences = sentences;
    if (!keepIndex || this.index >= sentences.length) {
      this.index = sentences.length ? 0 : -1;
    }
    this._emit();
  }

  next() {
    if (!this.sentences.length) return;
    this.index = Math.min(this.index + 1, this.sentences.length - 1);
    this._emit();
  }

  prev() {
    if (!this.sentences.length) return;
    this.index = Math.max(this.index - 1, 0);
    this._emit();
  }

  current() {
    return this.index >= 0 ? this.sentences[this.index] : null;
  }

  _emit() {
    if (this.onChange) this.onChange(this.current(), this.index);
  }

  _handleKeydown(e) {
    if (e.key !== "Tab") return;
    e.preventDefault(); 
    if (e.shiftKey) this.prev();
    else this.next();
  }
}