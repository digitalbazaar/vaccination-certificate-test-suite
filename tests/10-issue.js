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

// do not test these implementations' issuers or verifiers
const notTest = [
  'Dock',
  'Factom',
  'Sicpa',
  // Error: "Credential could not be verified" for mulitple VCs
  // from multiple vendors.
  'Trybe',
  // verifier unable to resolve did:key and other issuers
  'DanubeTech',
  // verifier returns 404 for all credentials
  'Trustbloc',
  // Unable to filter proofs: method-not-supported for multiple VCs
  // from different vendors (was able to verify themselves, Mattr, & others)
  'Spruce'
];

// remove the notTest implementations
for(const fileName of notTest) {
  delete implementations[fileName];
}

describe('Vaccine Credentials', function() {
  for(const key in certificates) {
    const certificate = certificates[key];
    describe(certificate.name, function() {
      // this is the credential for the verifier tests
      let credential = null;
      for(const issuerKey in implementations) {
        const settings = implementations[issuerKey];
        describe(settings.name, function() {
          before(async function() {
            const implementation = new Implementation(settings);
            const response = await implementation.issue(
              {credential: certificate});
            should.exist(response);
            // this credential is not tested
            // we just send it to each verifier
            credential = response.data;
          });
          // this ensures the implementation issuer
          // issues correctly
          it(`should be issued by ${settings.name}`, async function() {
            const implementation = new Implementation(settings);
            const response = await implementation.issue(
              {credential: certificate});
            should.exist(response);
            //response.status.should.equal(201);
            testCredential(response.data);
            credential = response.data;
            credential.credentialSubject.should.eql(
              certificate.credentialSubject);
          });
          // this sends a credential issued by the implementation
          // to each verifier
          for(const verifierKey in implementations) {
            const verifierSettings = implementations[verifierKey];
            const testTitle = `should be verified by ${verifierSettings.name}`;
            it(testTitle, async function() {
              const implementation = new Implementation(verifierSettings);
              const response = await implementation.verify({credential});
              should.exist(response);
              // verifier returns 200
              response.status.should.equal(200);
              should.exist(response.data);
              // verifier reponses vary but are all objects
              response.data.should.be.an('object');
            });
          }
        });
      }
    });
  }
});
