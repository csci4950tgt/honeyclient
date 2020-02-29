import Tesseract from 'tesseract.js';

export default class OCRManager {
  constructor(lang = 'eng') {
    this.lang = lang;
    this.worker = Tesseract.createWorker();
  }

  async getTextFromImage(lang = this.lang, screenShot) {
    await this.worker.load();
    await this.worker.loadLanguage(lang);
    await this.worker.initialize(lang);

    const {
      data: { text },
    } = await this.worker.recognize(screenShot);

    await this.worker.terminate();

    console.log(`Recognized the following text in image: ${text}`);
    console.log(text);

    return text;
  }

  processImages(lang = this.lang, screenshots) {
    return screenshots.map(ss => this.getTextFromImage(lang, ss));
  }
}
