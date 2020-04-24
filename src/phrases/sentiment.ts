import { TextItem } from "./textitem";

export class Sentiment extends TextItem {
  private _score: number;

  constructor(str: string, score: number) {
    super(str);
    this._score = score;
  }

  public get score() {
    return this._score;
  }
}
