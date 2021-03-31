/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as fs from 'fs/promises';
import {createReadStream} from 'fs';
import {finished} from 'stream';
import {promisify} from 'util';
import {join} from 'path';
import csv from 'csv-parse';

const asyncFinished = promisify(finished);

const conditionsList = 'WHO list of vaccinable Conditions.csv';

/**
 * Gets the WHO Data dir used to produce certificates.
 *
 * @param {string} path - A path to the who data dir.
 *
 * @throws {Error} - Throws if the dir is not found or is empty.
 *
 * @returns {Promise<Array<string>>} Dir and file names.
*/
async function getDir(path) {
  const directory = await fs.readdir(path);
  if(directory.length <= 0) {
    throw new Error(`Dir ${path} is empty`);
  }
  return directory;
}

function getVaccines({records, start = 1}) {
  // the sections of the csv are separated by empty rows
  const firstEmpty = records.findIndex(r => r.every(e => e === ''));
  // so we return all the vaccines before the first empty row
  return records.slice(start, firstEmpty);
}

async function getCSV({path, parser = new csv.Parser()}) {
  const records = [];
  const fileStream = createReadStream(path).pipe(parser);
  fileStream.on('readable', function() {
    let record = fileStream.read();
    while(record != null) {
      records.push(record);
      record = fileStream.read();
    }
  });
  await asyncFinished(fileStream);
  return records;
}

function createVC(vaccine) {
  // each vaccine is an array with 5 items in it.
  /*
  [
    'WHO list of vaccinable conditions',
    'ICD-11 code',
    'ICD-11 URI',
    'ICD-10 code ',
    'ICD-9-CM code'
  ]
  */
  const [
    condition,
    ICD11Code,
    ICD11URI,
    ICD10Code,
    ICD9CM
  ] = vaccine;
  const contexts = [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vaccination/v1'
  ];
  const type = [
    'VerifiableCredential',
    'VaccinationCertificate'
  ];
  console.log({
    condition,
    ICD11Code,
    ICD11URI,
    ICD10Code,
    ICD9CM
  });
  const fileName = `${ICD11Code || ICD9CM}.json`;
  const certificate = {
    '@context': contexts,
    type,
    id: 'urn:uuid:${uuid}',
    name: condition,
    description: condition,
    // the test can fill this in 30 days from test time
    expirationDate: null,
    credentialSubject: {
      type: 'VaccinationEvent',
      batchNumber: String(Math.floor(Math.random() * 1000)),
      administeringCentre: 'NiH',
      healthProfessional: 'NiH',
      countryOfVaccination: 'U.S.A.',
      recipient: {
        type: 'VaccineRecipient',
        givenName: 'JOHN',
        familyName: 'SMITH',
        gender: 'Male',
        birthDate: '1958-07-17'
      },
      vaccine: {
        type: 'Vaccine',
        disease: condition,
        // NOTE: this needs to be updated
        atcCode: ICD11Code
      }
    }
  };
  return {fileName, certificate};
}

/**
 * Formats data from the WHO into test data.
 *
 * @returns {Promise} Writes data to `/certificates` and exits.
*/
async function generateCertificates() {
  try {
    const whoData = join(process.cwd(), '.who-data', 'svc');
    try {
      await getDir(whoData);
    } catch(e) {
      console.error(e);
      console.error('\n Did you run `npm run fetch-who-int-svc`?');
      return;
    }
    const paths = {
      conditions: join(whoData, 'input', 'data', conditionsList),
      certificates: join(process.cwd(), 'certificates')
    };
    // dir with the csv file of vaccinable conditions
    const records = await getCSV({path: paths.conditions});
    const vaccineList = getVaccines({records});
    await Promise.all(vaccineList.map(v => {
      const {fileName, certificate} = createVC(v);
      const filePath = join(paths.certificates, fileName);
      return fs.writeFile(filePath, JSON.stringify(certificate, null, 2));
    }));
  } catch(e) {
    console.error(e);
  }
}

generateCertificates();
