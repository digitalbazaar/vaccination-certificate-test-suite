/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {v4 as uuid} from 'uuid';
import {join} from 'path';
import {writeJSON, getDir, getCSV} from './io.js';

const conditionsList = 'WHO list of vaccinable Conditions.csv';

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
    id: `urn:uuid:${uuid()}`,
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

// some of the vaccines are are in fact titles
// with no codes
function isTitle(vaccine) {
  // remove the title and just look at the codes.
  const codes = vaccine.slice(1);
  // if there are no codes this is probably a condition title
  return codes.every(c => c.trim() === '');
}

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
    let title = null;
    await Promise.all(vaccineList.flatMap(vaccine => {
      // titles have no codes
      if(isTitle(vaccine)) {
        title = vaccine[0].trim();
        // don't include titles in the list
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
