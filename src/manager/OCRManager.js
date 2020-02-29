import Tesseract from 'tesseract.js';
import EventEmitter from 'events';

// notifier once initialized
class OCRReadyEmitter extends EventEmitter {}

export default class OCRManager {
  constructor(lang = 'eng') {
    this.lang = lang;
    this.worker = Tesseract.createWorker({
      logger: m => console.log(m),
      errorHandler: m => console.error(m),
    });
    this.ready = false;
    this.readyEmitter = new OCRReadyEmitter();
  }

  async init() {
    await this.worker.load();
    await this.worker.loadLanguage(this.lang);
    await this.worker.initialize(this.lang);

    this.ready = true;
    this.readyEmitter.emit('ready');
  }

  // helper to avoid race condition on startup
  waitUntilReady() {
    return new Promise(resolve => {
      if (this.ready) {
        resolve(true);
      } else {
        this.readyEmitter.on('ready', resolve);
      }
    });
  }

  async getTextFromImage(screenshot) {
    console.log(`Start recognition process for ${screenshot.filename}.`);

    const res = await this.worker.recognize(screenshot.data);

    console.log(`Recognized the following text in image: ${res.data.text}`);

    // assemble a file artifact-like object
    return {
      ticketId: screenshot.ticketId,
      filename: `recognize-${screenshot.filename}.ocr`,
      data: Buffer.from(res.data.text),
    };
  }

  processImages(screenshots) {
    // use Promise.all to wait for all screenshots to process
    // also does work in parallel
    return Promise.all(screenshots.map(ss => this.getTextFromImage(ss)));
  }

  // Currently unused - shutdown OCR worker
  shutdown() {
    return this.worker.terminate();
  }
}
