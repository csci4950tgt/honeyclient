export default class Screenshot {
  constructor(width, height, filename, userAgent) {
    this.width = width;
    this.height = height;
    this.filename = filename;
    this.userAgent = userAgent;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getFilename() {
    return this.filename;
  }

  getUserAgent() {
    return this.userAgent;
  }
}
