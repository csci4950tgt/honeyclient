import yara from 'yara';
import { promisify } from 'util';
import AsyncWorker from './AsyncWorker.js';

export default class YaraManager extends AsyncWorker {
  constructor() {
    super('yara');

    this.resources = [];
  }

  parseResource(res) {
    return JSON.parse(res.data.toString('utf8'));
  }

  cleanupResources() {
    const isError = res => this.parseResource(res).error;
    const hasErrorResource = this.resources.some(isError);

    // remove non-error resources if there's an error
    this.resources = this.resources.filter(
      res => hasErrorResource && !this.parseResource(res).error
    );

    if (this.resources.every(isError) && this.resources.length > 1) {
      console.warn('yara: multiple error resources, only returning one.');

      this.resources.length = 1;
    }

    if (this.resources.length > 1) {
      console.warn('yara: returning invalid resource');
      console.log(this.resources);
    }
  }

  /*
   * This Method scans a list of raw text artifacts using
   * a set of Yara rules. Returns the text artifacts that match
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
  async setupResourceScan(resources, ticket) {
    super.start();

    const ticketId = ticket.getID();
    const responseFile = 'response.yara';
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

      if (warnings.length > 0) {
        console.log(`Compile warnings: ${JSON.stringify(warnings)}`);

        this.resources.push(
          this.createYaraArtifact(ticketId, responseFile, true)
        );
      } else {
        let matchFlag = false;

        for (const text of resources) {
          const buf = { buffer: text.data };

          try {
            const result = await new Promise((resolve, reject) =>
              scanner.scan(buf, (error, res) =>
                error ? reject(error) : resolve(res)
              )
            );

            if (result.rules.length) {
              const matchText = `match: ${JSON.stringify(result)}`;

              matchFlag = true;
              this.resources.push(
                this.createYaraArtifact(
                  ticketId,
                  text.filename + '.yara',
                  false,
                  true,
                  matchText
                )
              );
            }
          } catch (error) {
            console.log(error);

            this.resources.push(
              this.createYaraArtifact(ticketId, text.filename + '.yara', true)
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

    this.cleanupResources();
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
      filename,
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
}
