import { Sentiment } from "./sentiment";
import { TextManager } from "./textmanager";

export class SentimentManager extends TextManager {
  public add = (str: string, score: number) =>
    this._items.push(new Sentiment(str, score));

  private sort = (func: (a: Sentiment, b: Sentiment) => number) => {
    const newArray = [...this._items] as Sentiment[];
    newArray.sort(func);

    return newArray;
  };

  public sortGood = () => {
    return this.sort((a, b) => {
      return b.score - a.score;
    });
  };

  public sortBad = () => {
    return this.sort((a, b) => {
      return a.score - b.score;
    });
  };
}
