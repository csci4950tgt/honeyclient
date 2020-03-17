import EventEmitter from 'events';

// notifier once work finished
class ReadyEmitter extends EventEmitter {}

export default class AsyncWorker {
  constructor(operation) {
    this.operation = operation;
    this.ready = false;
    this.readyEmitter = new ReadyEmitter();
    this.wallClock = Date.now();
  }

  start() {
    console.log(`Start operation ${this.operation}.`);

    this.wallClock = Date.now();
  }

  finish() {
    const delta = Date.now() - this.wallClock;

    console.log(`Operation ${this.operation} completed in ${delta}ms.`);
  }

  waitUntilReady() {
    return new Promise(resolve => {
      if (this.ready) {
        resolve(true);
      } else {
        this.readyEmitter.on('ready', resolve);
      }
    });
  }

  ready() {
    this.ready = true;
    this.readyEmitter.emit('ready');
  }
}
