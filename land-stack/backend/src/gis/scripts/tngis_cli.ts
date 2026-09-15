import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Placeholder imports for the ingestion pipeline functions
import { discoverDatasets } from '../ingestion/tngis/discovery/discover';
import { importDataset } from '../ingestion/tngis/loaders/importer';
import { verifyDataset } from '../ingestion/tngis/validators/verifier';

async function main() {
  await yargs(hideBin(process.argv))
    .scriptName("tngis_cli")
    .command('discover', 'Discover and register TNGIS datasets', () => {}, async (argv) => {
      console.log('Starting TNGIS Dataset Discovery...');
      await discoverDatasets();
    })
    .command('import', 'Import a TNGIS dataset into PostGIS', (yargs) => {
      return yargs
        .option('dataset', {
          alias: 'd',
          type: 'string',
          description: 'Dataset key (e.g. districts, roads, forest)',
        })
        .option('all-accessible', {
          alias: 'a',
          type: 'boolean',
          description: 'Import all accessible datasets',
        });
    }, async (argv) => {
      if (argv.allAccessible) {
        console.log('Importing all accessible datasets...');
        // await importAllAccessibleDatasets();
      } else if (argv.dataset) {
        console.log(`Importing dataset: ${argv.dataset}...`);
        await importDataset(argv.dataset as string);
      } else {
        console.error('Please specify --dataset <name> or --all-accessible');
      }
    })
    .command('verify', 'Verify data quality for imported datasets', () => {}, async (argv) => {
      console.log('Verifying imported datasets...');
      await verifyDataset();
    })
    .help()
    .demandCommand(1, 'You need to specify at least one command')
    .parse();
}

main().catch(err => {
  console.error('CLI Error:', err);
  process.exit(1);
});
