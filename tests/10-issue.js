/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as chai from 'chai';
import Implementation from './implementation.js';
import {testCredential} from './assertions.js';

const should = chai.should();

// we need this as a test so the implementations
// and certificates have been loaded
it('Vaccine Credentials', function() {
  const implementations = global.test.implementations;
  const certificates = global.test.certificates;
  for(const certificate of certificates) {
    describe(certificate.name, function() {
      let credential = null;
      for(const settings of implementations) {
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
          for(const _settings of implementations) {
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
