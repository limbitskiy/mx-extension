export class QueueController {
  private queue: string[] = [];
  private isBusy: boolean = false;
  private parseFn: (url: string) => void;

  constructor(parseFn: (url: string) => void) {
    this.parseFn = parseFn;
  }

  private next() {
    if (!this.isBusy) {
      const nextUrl = this.queue.shift();

      if (nextUrl) {
        console.log(`switching to next url in queue`);
        console.log({ currentQueue: this.queue });

        this.parseFn(nextUrl);
        this.isBusy = true;
      }
    }
  }

  add(url: string) {
    if (!this.queue.includes(url)) {
      this.queue.push(url);
      console.log(`adding an url to queue`);
      console.log({ currentQueue: this.queue });
    } else {
      console.log(`url already in queue`);
      console.log({ currentQueue: this.queue });
    }

    if (!this.isBusy) {
      this.next();
    }
  }

  finish() {
    this.isBusy = false;

    setTimeout(() => {
      this.next();
    }, 5000);
  }
}
