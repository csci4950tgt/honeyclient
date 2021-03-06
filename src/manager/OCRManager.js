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

    let res;

    try {
      res = await recognize(screenshot.data, { language: this.lang });
    } catch (e) {
      // sometimes this can fail, if it does, we skip to the next one.
      // seems to have something to do with .svg files and trying to retrieve the
      // manifest URL.

      return null;
    }

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
    let result = await Promise.all(
      screenshots.map(ss => this.getTextFromImage(ss))
    );

    super.finish();

    // filter out `null`:
    result = result.filter(s => s);

    return result;
  }
}

// cleanup on premature exit:
process.on('exit', () => recognize.cancelAll());
