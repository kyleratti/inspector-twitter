import { TextItem } from "./textitem";

export class Phrase extends TextItem {
  private _count = 1;

  public get count() {
    return this._count;
  }

  public increment = () => this._count++;
}
