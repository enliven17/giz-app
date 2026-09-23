export class BaseClass {
  static create<T extends BaseClass>(this: new () => T, data: T): T {
    return Object.assign(new this(), data);
  }
}
