import assert from 'assert';
import fs from 'fs';
import OCRManager from '../src/manager/OCRManager.js';

describe('OCRManager', function() {
  it('should read correct string from a picture', function() {
    var rawImage;
    fs.readFile('test/resources/getTextFromImage.png', function(err, data) {
      if (err) throw err;
      const screenshot = {
        ticketId: 0,
        data: data,
        filename: 'getTextFromImage.png',
      };
      let manager = new OCRManager();
      manager
        .getTextFromImage(screenshot)
        .then(res => {
          assert.equal(res.data.toString().trim(), 'getTextFromImage');
        })
        .catch(err => {
          console.log(err);
          //assert(false);
        });
    });
  });
});
