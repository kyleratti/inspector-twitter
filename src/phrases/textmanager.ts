import { TextItem } from "./textitem";

export abstract class TextManager {
  protected _items = new Array<TextItem>();

  public get size() {
    return this._items.length;
  }

  public contains = (str: string) => {
    for (let i = 0; i < this._items.length; i++) {
      const phrase = this._items[i];
      if (phrase.text.toLowerCase() === str.toLowerCase()) return true;
    }

    return false;
  };

  public get = (str: string) => {
    for (let i = 0; i < this._items.length; i++) {
      const phrase = this._items[i];
      if (phrase.text.toLowerCase() === str.toLowerCase()) return phrase;
    }

    return undefined;
  };
}
