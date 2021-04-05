/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import Implementation from './implementation.js';
import {getJSONFiles} from '../io.js';
import {paths} from '../paths.js';
import * as chai from 'chai';

const should = chai.should();

// do not test these implementations issuers or verifiers
const notTest = ['Dock', 'Factom', 'SICPA', 'Trybe'];

describe('Vaccine Credentials', function() {
  let implementations;
  let certificates;
  before(async function() {
    const vendors = await getJSONFiles(paths.implementations);
    // TODO remove filter for Digital Bazaar only
    implementations = vendors.filter(v => !notTest.includes(v.name));
    certificates = await getJSONFiles(paths.certificates);
  });
  it('should have certificates', function() {
    for(const certificate of certificates) {
      describe(certificate.name, function() {
        for(const settings of implementations) {
          it(`should be issued by ${settings.name}`, async function() {
            const implementation = new Implementation(settings);
            const response = await implementation.issue(
              {credential: certificate});
            should.exist(response);
            response.status.should.equal(201);
            should.exist(response.data);
            response.data.should.be.an('object');
          });
        }
      });
    }
  });
});
