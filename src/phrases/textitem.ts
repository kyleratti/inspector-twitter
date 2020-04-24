export class TextItem {
  private _text: string;

  constructor(str: string) {
    this._text = str;
  }

  public get text(): string {
    return this._text;
  }
}
