import EventEmitter from 'events';

// notifier once work finished
class ReadyEmitter extends EventEmitter {}

export default class AsyncWorker {
  constructor() {
    this.ready = false;
    this.readyEmitter = new ReadyEmitter();
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
