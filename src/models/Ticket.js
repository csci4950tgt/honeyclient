export default class Ticket {
  constructor(ID, url, screenshots) {
    this.ID = ID;
    this.url = url;
    this.screenshots = screenshots;
  }

  getID() {
    return this.ID;
  }

  getURL() {
    return this.url;
  }

  getScreenshots() {
    return this.screenshots;
  }
}
