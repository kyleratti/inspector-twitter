import { Phrase } from "./phrase";

export class PhraseManager {
  private _phrases = new Array<Phrase>();

  public get size() {
    return this._phrases.length;
  }

  public contains = (str: string) => {
    for (let i = 0; i < this._phrases.length; i++) {
      const phrase = this._phrases[i];
      if (phrase.text.toLowerCase() === str.toLowerCase()) return true;
    }

    return false;
  };

  public addOrIncrement = (str: string) => {
    if (!this.contains(str)) {
      this._phrases.push(new Phrase(str));
    } else {
      let a = this.get(str);

      if (a) a.increment();
    }
  };

  public get = (str: string) => {
    for (let i = 0; i < this._phrases.length; i++) {
      const phrase = this._phrases[i];
      if (phrase.text.toLowerCase() === str.toLowerCase()) return phrase;
    }

    return undefined;
  };

  public getSorted = () => {
    const newArray = [...this._phrases];
    newArray.sort((a, b) => {
      return b.count - a.count;
    });

    return newArray;
  };
}
