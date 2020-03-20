import recognize from 'tesseractocr';
import path from 'path';
import AsyncWorker from './AsyncWorker.js';

export default class OCRManager extends AsyncWorker {
  constructor(lang = 'eng') {
    super('OCR');

    this.lang = lang;
  }

  async getTextFromImage(screenshot) {
    console.log(`Start recognition process for ${screenshot.filename}.`);

    const res = await recognize(screenshot.data, { language: this.lang });

    console.log(`Recognized the following text in image: ${res}`);

    // don't include .png:
    const baseScreenshotPath = path.parse(screenshot.filename).name;

    // assemble a file artifact-like object
    return {
      ticketId: screenshot.ticketId,
      filename: `recognize-${baseScreenshotPath}.ocr`,
      data: Buffer.from(res),
    };
  }

  async processImages(screenshots) {
    super.start();

    // use Promise.all to wait for all screenshots to process
    // also does work in parallel
    const result = await Promise.all(
      screenshots.map(ss => this.getTextFromImage(ss))
    );

    super.finish();

    return result;
  }
}

// cleanup on premature exit:
process.on('exit', () => recognize.cancelAll());
