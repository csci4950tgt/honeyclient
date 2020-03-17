import yara from 'yara';
import { promisify } from 'util';
import AsyncWorker from './AsyncWorker.js';

export default class YaraManager extends AsyncWorker {
  constructor() {
    super('yara');

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
  async setupResourceScan(jsArtifacts, ticket) {
    console.log('Scanning JS...');
    super.start();

    const ticketId = ticket.getID();
    const responseFile = 'yara_response.txt';
    const initialize = promisify(yara.initialize);

    try {
      // link to yara binary
      await initialize();

      const rules = [{ filename: 'src/resources/rules.yara' }];
      const scanner = yara.createScanner();
      const warnings = await new Promise((resolve, reject) =>
        scanner.configure({ rules }, (error, warnings) =>
          error ? reject(error) : resolve(warnings)
        )
      );

      if (warnings.length) {
        console.log('Compile warnings: ' + JSON.stringify(warnings));

        this.resources.push(
          this.createYaraArtifact(ticketId, responseFile, true)
        );
      } else {
        let matchFlag = false;

        for (const js of jsArtifacts) {
          const buf = { buffer: js.data };
          const scan = promisify(scanner.scan);

          try {
            const result = await scan(buf);

            if (result.rules.length) {
              const matchText = 'match: ' + JSON.stringify(result);

              matchFlag = true;
              this.resources.push(
                this.createYaraArtifact(
                  ticketId,
                  js.filename,
                  false,
                  true,
                  matchText
                )
              );
            }
          } catch (error) {
            this.resources.push(
              this.createYaraArtifact(ticketId, js.filename, true)
            );
          }
        }

        // no rules matched sample
        if (!matchFlag) {
          this.resources.push(
            this.createYaraArtifact(ticketId, responseFile, false, false)
          );
        }
      }
    } catch (error) {
      if (error instanceof yara.CompileRulesError) {
        console.log(`${error.message}: ${JSON.stringify(error.errors)}`);
      } else {
        console.log(error.message);
      }

      this.resources.push(
        this.createYaraArtifact(ticketId, responseFile, true)
      );
    }

    super.finish();

    return this.resources;
  }

  /*
   * Helper for creating a JSON response from a scan result.
   */
  createYaraArtifact(
    ticketID,
    filename,
    error,
    isMalicious = null,
    matchedRule = null
  ) {
    return {
      ticketID,
      filename: filename,
      data: Buffer.from(
        JSON.stringify({
          error: error,
          isMalicious: isMalicious,
          matchedRule: matchedRule,
        }),
        'utf8'
      ),
    };
  }

  process() {
    return this.resources;
  }
}
