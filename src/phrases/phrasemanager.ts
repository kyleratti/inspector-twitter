import { Phrase } from "./phrase";
import { TextManager } from "./textmanager";

export class PhraseManager extends TextManager {
  public addOrIncrement = (str: string) => {
    if (!this.contains(str)) {
      this._items.push(new Phrase(str));
    } else (this.get(str) as Phrase).increment();
  };

  public getSorted = () => {
    const newArray = [...this._items] as Phrase[];
    newArray.sort((a, b) => {
      return b.count - a.count;
    });

    return newArray;
  };
}
