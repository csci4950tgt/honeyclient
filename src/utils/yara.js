import yara from 'yara';

export default class YaraManager {
  constructor() {
    this.resources = [];
  }

  /*
   * This Method scans a list of raw js artifacts using
   * a set of Yara rules. Returns the Js artifacts that match
   * otherwise, no malware was detected.
   *
   * If an error occurs in processing, values are pushed to the RO
   * in order to be handled correctly by our api.
   *
   * When pushing errors to the RO data buffer:
   *      error: boolean (whether or not an error has occurred in processing)
   *      matchedRule: only valid if (isMalicious == true)
   *      isMalicious: boolean, null if unknown
   */
  setupResourceScan(jsArtifacts, ticket) {
    console.log('Scanning JS...');
    const ticketId = ticket.getID();

    yara.initialize(error => {
      if (error) {
        console.log(error.message);

        this.resources.push({
          ticketId,
          filename: 'yara_error.txt',
          data: Buffer.from(
            JSON.stringify({
              error: true,
              isMalicious: null,
              matchedRule: null,
            }),
            'utf8'
          ),
        });
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
              data: Buffer.from(
                JSON.stringify({
                  error: true,
                  isMalicious: null,
                  matchedRule: '',
                }),
                'utf8'
              ),
            });
          } else {
            if (warnings.length) {
              console.log('Compile warnings: ' + JSON.stringify(warnings));

              this.resources.push({
                ticketId,
                filename: 'yara_error.txt',
                data: Buffer.from(
                  JSON.stringify({
                    error: true,
                    isMalicious: null,
                    matchedRule: '',
                  }),
                  'utf8'
                ),
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
                      data: Buffer.from(
                        JSON.stringify({
                          error: true,
                          isMalicious: null,
                          matchedRule: '',
                        }),
                        'utf8'
                      ),
                    });
                  } else {
                    if (result.rules.length) {
                      matchFlag = 1;
                      const matchText = 'match: ' + JSON.stringify(result);

                      this.resources.push({
                        ticketId,
                        filename: js.filename,
                        data: Buffer.from(
                          JSON.stringify({
                            error: false,
                            isMalicious: true,
                            matchedRule: matchText,
                          }),
                          'utf8'
                        ),
                      });
                    }
                  }
                });
              });

              if (matchFlag === 0) {
                this.resources.push({
                  ticketId,
                  filename: 'safe_by_yara.txt',
                  data: Buffer.from(
                    JSON.stringify({
                      error: false,
                      isMalicious: false,
                      matchedRule: '',
                    }),
                    'utf8'
                  ),
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
