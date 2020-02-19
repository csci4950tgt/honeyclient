import yara from 'yara';

export default class YaraManager {
  constructor() {
    this.resources = [];
  }

  /*
   * This Method scans a list of raw js artifacts using
   * a set of Yara rules. Returns the Js artifacts that match
   * otherwise, no malware was detected.
   */
  setupResourceScan(jsArtifacts, ticket) {
    console.log('Scanning JS...');
    const ticketId = ticket.getID();

    yara.initialize(function(error) {
      if (error) {
        console.log(error.message);
      } else {
        const rules = [{ filename: 'src/resources/rules.yara' }];

        const scanner = yara.createScanner();
        scanner.configure({ rules: rules }, function(error, warnings) {
          if (error) {
            if (error instanceof yara.CompileRulesError) {
              console.log(error.message + ': ' + JSON.stringify(error.errors));
            } else {
              console.log(error.message);
            }
          } else {
            if (warnings.length) {
              console.log('Compile warnings: ' + JSON.stringify(warnings));
            } else {
              let matchFlag = 0;

              jsArtifacts.forEach(js => {
                const file = js.data.toString();
                const buf = { buffer: Buffer.from(file) };
                scanner.scan(buf, function(error, result) {
                  if (error) {
                    console.log(error);
                  } else {
                    if (result.rules.length) {
                      matchFlag = 1;
                      const matchText = 'match: ' + JSON.stringify(result);

                      this.resources.push({
                        ticketId,
                        filename: js.filename,
                        data: Buffer.from(matchText, 'utf8'),
                      });
                    }
                  }
                });
              });
              if (matchFlag === 0) {
                const noMatchText = 'no malware detected by scan';

                this.resources.push({
                  ticketId,
                  filename: '', //all files
                  data: Buffer.from(noMatchText, 'utf8'),
                });
              }
            }
          }
        });
      }
    });
  }

  process() {
    return this.resources;
  }
}
