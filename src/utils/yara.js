import yara from 'yara';

export default class YaraManager {
  scanResources = async jsArtifacts => {
    console.log('Scanning JS...');

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
              // @TODO: Create a legitimate object response on scan to communicate safety back to frontend
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

                      // this is the meat and potatoes
                      console.log('match: ' + JSON.stringify(result));
                    }
                  }
                });
              });
              if (matchFlag === 0) {
                console.log(
                  `Scan of URL with ticket ID ${jsArtifacts[0].ticketId} shows no maliciousness`
                );
              }
            }
          }
        });
      }
    });
  };
}
