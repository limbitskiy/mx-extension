interface QueueObject {
  id: string;
}

export class QueueController {
  private queue: QueueObject[] = [];
  private isBusy: boolean = false;
  private parseFn: (queueObject: QueueObject) => void;
  private _currentItem: QueueObject | null = null;

  constructor(parseFn: (queueObject: QueueObject) => void) {
    this.parseFn = parseFn;
  }

  private next() {
    if (!this.isBusy) {
      const nextItem = this.queue.shift();

      if (nextItem) {
        console.log(`switching to next item in queue`);
        console.log({ currentQueue: this.queue });

        this._currentItem = nextItem;
        this.parseFn(nextItem);
        this.isBusy = true;
      }
    }
  }

  add(queueObject: QueueObject) {
    if (!this.queue.find((item) => item.id === queueObject.id)) {
      this.queue.push(queueObject);
      console.log(`adding an item to queue`);
      console.log({ currentQueue: this.queue });
    } else {
      console.log(`item already in queue`);
      console.log({ currentQueue: this.queue });
    }

    if (!this.isBusy) {
      this.next();
    }
  }

  finish() {
    this.isBusy = false;
    this._currentItem = null;

    setTimeout(() => {
      this.next();
    }, 5000);
  }

  get currentItem() {
    return this._currentItem;
  }
}
