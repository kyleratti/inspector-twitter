export class Phrase {
  private _text: string;
  private _count = 1;

  constructor(str: string) {
    this._text = str;
  }

  public get text(): string {
    return this._text;
  }

  public get count() {
    return this._count;
  }

  public increment = () => this._count++;
}
