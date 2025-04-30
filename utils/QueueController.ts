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
        this.parseFn(nextUrl);
        this.isBusy = true;
      }
    }
  }

  add(url: string) {
    this.queue.push(url);
    // console.log(`adding a url`);

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
