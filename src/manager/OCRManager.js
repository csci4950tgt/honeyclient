export default class OCRManager {
  constructor(lang = 'eng') {
    this._lang = lang;
    const { createWorker } = require('tesseract.js');
    this._worker = createWorker();
  }

  getTextFromImage = async (lang = this._lang, screenShot) => {
    await this._worker.load();
    await this._worker.loadLanguage(lang);
    await this._worker.initialize(lang);
    const {
      data: { text },
    } = await this._worker.recognize(screenShot);
    await this._worker.terminate();
    return text;
  };

  processImages(lang = this._lang, screenShots) {
    const textArtifacts = [];
    for (ss in screenShots) {
      textArtifacts.push(this.getTextFromImage(lang, ss));
    }
    return textArtifacts;
  }
}
