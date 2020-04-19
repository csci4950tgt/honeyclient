import assert from 'assert';

import dotenv from 'dotenv';
import SafeBrowsingManager from '../src/manager/SafeBrowsingManager.js';

describe('SafeBrowsingManager', function() {
  dotenv.config();
  let manager = new SafeBrowsingManager();
  it('should have an api key', function() {
    SafeBrowsingManager.checkApiKey();
    assert(true);
  });

  const malwareURL = 'http://testsafebrowsing.appspot.com/s/malware.html';
  const normalURL = 'https://google.com';
  it('should identify malware from a URL that contains malware', function() {
    manager
      .getMalwareMatches([malwareURL])
      .then(res => {
        assert(res[0].threatType === 'MALWARE');
      })
      .catch(err => {
        console.log(err);
        assert(false);
      });
  });

  it('should report no malware when testing a normal URL', function() {
    manager
      .getMalwareMatches([normalURL])
      .then(res => {
        console.log(res);
        assert(Array.isArray(res) && res.length === 0);
      })
      .catch(err => {
        console.log(err);
        assert(false);
      });
  });

  it('should be able to test multiple URLs simultaneously', function() {
    manager
      .getMalwareMatches([normalURL, malwareURL])
      .then(res => {
        assert(res[0].threatType === 'MALWARE');
      })
      .catch(err => {
        console.log(err);
        assert(false);
      });
  });
});
