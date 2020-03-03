import recognize from 'tesseractocr';
import path from 'path';

export default class OCRManager {
  constructor(lang = 'eng') {
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

  processImages(screenshots) {
    // use Promise.all to wait for all screenshots to process
    // also does work in parallel
    return Promise.all(screenshots.map(ss => this.getTextFromImage(ss)));
  }
}

// cleanup on premature exit:
process.on('exit', () => recognize.cancelAll());
