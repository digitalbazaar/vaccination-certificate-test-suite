/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import axios from 'axios';
import {getJSONFiles} from '../io.js';
import {paths} from '../paths.js';

// do not test these implementations issuers or verifiers
const notTest = ['Dock', 'Factom', 'SICPA', 'Trybe'];

describe('Vaccine Credentials', function() {
  let implementations;
  let certificates;
  before(async function() {
    const vendors = await getJSONFiles(paths.implementations);
    implementations = vendors.filter(v => !notTest.includes(v.name));
    certificates = await getJSONFiles(paths.certificates);
  });
  it('should have certificates', function() {
    for(const certificate of certificates) {
      describe(certificate.name, function() {
        for(const implementation of implementations) {
          it(`should be issued by ${implementation.name}`, async function() {
/*
            const result = await axios.post(implementation.issuer, certificate);
console.log({result});
*/
          });
        }
      });
    }
  });
});
