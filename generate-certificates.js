/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {v4 as uuid} from 'uuid';
import {join} from 'path';
import {writeJSON, getDir, getCSV} from './io.js';
import {paths} from './paths.js';

// FIXME: this needs to generate a real uvci.
function uvci() {
  const input = Buffer.from(uuid());
  return input.toString('base64');
}
function getVaccines({records, start = 1}) {
  // the sections of the csv are separated by empty rows
  const firstEmpty = records.findIndex(r => r.every(e => e === ''));
  // so we return all the vaccines before the first empty row
  return records.slice(start, firstEmpty);
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
  const fileName = `${(ICD11Code || ICD9CM).trim()}.json`;
  const certificate = {
    '@context': contexts,
    type,
    id: `urn:uvci:${uvci()}`,
    name: condition,
    description: condition,
    credentialSubject: {
      type: 'VaccinationEvent',
      batchNumber: String(Math.floor(Math.random() * 1000)),
      administeringCentre: 'U.S. Public Health Authority',
      healthProfessional: 'U.S. Public Health Authority',
      countryOfVaccination: 'United States of America',
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

// some of the vaccines are are in fact titles
// with no codes
function noCodes(vaccine) {
  // remove the title and just look at the codes.
  const codes = vaccine.slice(1);
  // if there are no codes this is probably a condition title
  return codes.every(c => c.trim() === '');
}

// some rows in the csv come directly below a title
// those rows the condition starts with -
function conditionSubtitle(vaccine) {
  const [condition] = vaccine;
  if(condition.trim().startsWith('-')) {
    return true;
  }
  return false;
}

/**
 * Formats data from the WHO into test data.
 *
 * @returns {Promise} Writes data to `/certificates` and exits.
*/
async function generateCertificates() {
  try {
    try {
      await getDir(paths.whoData);
    } catch(e) {
      console.error(e);
      console.error('\n Did you run `npm run fetch-who-int-svc`?');
      return;
    }
    // dir with the csv file of vaccinable conditions
    const records = await getCSV({path: paths.conditions});
    const vaccineList = getVaccines({records});
    let title = null;
    await Promise.all(vaccineList.flatMap(vaccine => {
      // if a row has no codes don't make a VC from it
      if(noCodes(vaccine)) {
        // titles have no codes
        title = vaccine[0].trim();
        return [];
      }
      const subtitle = conditionSubtitle(vaccine);
      if(!subtitle) {
        title = vaccine[0].trim();
      }
      if(subtitle) {
        // add the condition name before the vaccine name
        vaccine[0] = `${title}${vaccine[0]}`;
      }
      const {fileName, certificate} = createVC(vaccine);
      const filePath = join(paths.certificates, fileName);
      return writeJSON({path: filePath, data: certificate});
    }));
  } catch(e) {
    console.error(e);
  }
}

generateCertificates();
