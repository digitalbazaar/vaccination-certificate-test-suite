/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as chai from 'chai';
import Implementation from './implementation.js';
import {testCredential} from './assertions.js';
import certificates from '../certificates.cjs';
import implementations from '../implementations.cjs';

const should = chai.should();

// do not test these implementations issuers or verifiers
const notTest = ['Dock', 'Factom', 'Sicpa', 'Trybe'];

// remove the notTest implementations
for(const fileName of notTest) {
  delete implementations[fileName];
}

// we need this as a test so the implementations
// and certificates have been loaded
describe('Vaccine Credentials', function() {
  for(const key in certificates) {
    const certificate = certificates[key];
    describe(certificate.name, function() {
      let credential = null;
      for(const key in implementations) {
        const settings = implementations[key];
        describe(settings.name, function() {
          before(async function() {
            const implementation = new Implementation(settings);
            const response = await implementation.issue(
              {credential: certificate});
            should.exist(response);
            testCredential(response.data);
            credential = response.data;
          });
          it(`should be issued by ${settings.name}`, async function() {
            const implementation = new Implementation(settings);
            const response = await implementation.issue(
              {credential: certificate});
            should.exist(response);
            response.status.should.equal(201);
            testCredential(response.data);
            credential = response.data;
            credential.credentialSubject.should.eql(
              certificate.credentialSubject);
          });
          for(const _key in implementations) {
            const _settings = implementations[_key];
            it(`should be verified by ${_settings.name}`, async function() {
              const i = new Implementation(_settings);
              await i.verify({credential});
            });
          }
        });
      }
    });
  }
});
