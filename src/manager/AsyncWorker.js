import EventEmitter from 'events';

// notifier once work finished
class ReadyEmitter extends EventEmitter {}

export default class AsyncWorker {
  constructor(operation) {
    this.operation = operation;
    this.isReady = false;
    this.readyEmitter = new ReadyEmitter();
    this.wallClock = Date.now();
  }

  start() {
    console.log(`Start operation ${this.operation}.`);

    this.wallClock = Date.now();
  }

  finish() {
    if (!this.isReady) return;

    const delta = Date.now() - this.wallClock;

    console.log(`Operation ${this.operation} completed in ${delta}ms.`);
  }

  waitUntilReady() {
    return new Promise(resolve => {
      if (this.isReady) {
        resolve(true);
      } else {
        this.readyEmitter.on('ready', resolve);
      }
    });
  }

  ready() {
    if (!this.isReady) {
      this.isReady = true;
      this.readyEmitter.emit('ready');
    }
  }
}
