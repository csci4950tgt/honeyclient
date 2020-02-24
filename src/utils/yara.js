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

    yara.initialize(error => {
      if (error) {
        console.log(error.message);
      } else {
        const rules = [{ filename: 'src/resources/rules.yara' }];

        const scanner = yara.createScanner();
        scanner.configure({ rules: rules }, (error, warnings) => {
          if (error) {
            if (error instanceof yara.CompileRulesError) {
              console.log(error.message + ': ' + JSON.stringify(error.errors));
            } else {
              console.log(error.message);
            }

            this.resources.push({
              ticketId,
              filename: 'yara_error.txt',
              data: Buffer.from(JSON.stringify('error'), 'utf8'),
            });
          } else {
            if (warnings.length) {
              console.log('Compile warnings: ' + JSON.stringify(warnings));

              this.resources.push({
                ticketId,
                filename: 'yara_error.txt',
                data: { error: true },
              });
            } else {
              let matchFlag = 0;

              jsArtifacts.forEach(js => {
                const buf = { buffer: Buffer.from(file) };
                scanner.scan(buf, (error, result) => {
                  if (error) {
                    this.resources.push({
                      ticketId,
                      filename: js.filename,
                      data: Buffer.from(error, 'utf8'),
                    });
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
                this.resources.push({
                  ticketId,
                  filename: 'safe_by_yara.txt',
                  data: { isMaliciousByYara: false },
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
