/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as chai from 'chai';
import Implementation from './implementation.js';
import {testCredential} from './assertions.js';
import certificates from '../certificates.cjs';
import allVendors from '../implementations.cjs';

const should = chai.should();

// do not test these implementations' issuers or verifiers
const notTest = [
  'Dock',
  'Factom',
  'SICPA',
  // Error: "Credential could not be verified" for mulitple VCs
  // from multiple vendors.
  'Trybe',
  // verifier returns 404 for all credentials
  'Trustbloc',
  // Unable to filter proofs: method-not-supported for multiple VCs
  // from different vendors (was able to verify themselves, Mattr, & others)
  'Spruce'
];

// remove the notTest implementations

const implementations = allVendors.filter(v => !notTest.includes(v.name));

const results = certificates.map(certificate => ({
  certificate,
  issuers: implementations.map(issuer => ({
    issuer,
    result: false,
    verifiers: implementations.map(verifier => ({
      verifier,
      result: false
    }))
  }))
}));

describe('Vaccine Credentials', function() {
  for(const certificate of certificates) {
    // finds the report for this certificate
    const certificateReport = results.find(
      r => r.certificate.id === certificate.id);
    describe(certificate.name, function() {
      const columnNames = [];
      before(function() {
        // this will tell the report
        // to make an interop matrix with this suite
        this.test.parent.matrix = true;
        this.test.parent.report = true;
        this.test.parent.columns = columnNames;
      });

      // this is the credential for the verifier tests
      let credential = null;
      for(const issuer of implementations) {
        // find the report for this issuer
        const issuerReport = certificateReport.issuers.find(
          report => report.issuer.name === issuer.name);
        describe(issuer.name, function() {
          before(async function() {
            try {
              // set the display name for this row
              this.test.parent.rowName = issuer.name;
              // ensure this implementation is a column in the matrix
              columnNames.push(issuer.name);
              const implementation = new Implementation(issuer);
              const response = await implementation.issue(
                {credential: certificate});
              should.exist(response);
              // this credential is not tested
              // we just send it to each verifier
              credential = response.data;
            } catch(e) {
              console.error(`${issuer.name} failed to issue a ` +
                'credential for verification tests', e);
              throw e;
            }
          });
          // this ensures the implementation issuer
          // issues correctly
          it(`should be issued by ${issuer.name}`, async function() {
            const implementation = new Implementation(issuer);
            const response = await implementation.issue(
              {credential: certificate});
            should.exist(response);
            //response.status.should.equal(201);
            testCredential(response.data);
            credential = response.data;
            credential.credentialSubject.should.eql(
              certificate.credentialSubject);
            issuerReport.result = true;
          });
          // this sends a credential issued by the implementation
          // to each verifier
          for(const verifier of implementations) {
            const verifierReport = issuerReport.verifiers.find(
              report => report.verifier.name === verifier.name);
            const testTitle = `should be verified by ${verifier.name}`;
            it(testTitle, async function() {
              // this tells the test report which cell
              // in the interop matrix the result goes in
              this.test.cell = {columnId: verifier.name, rowId: issuer.name};
              should.exist(credential);
              const implementation = new Implementation(verifier);
              const response = await implementation.verify({credential});
              should.exist(response);
              // verifier returns 200
              response.status.should.equal(200);
              should.exist(response.data);
              // verifier reponses vary but are all objects
              response.data.should.be.an('object');
              verifierReport.result = true;
            });
          }
        });
      }
    });
  }
});
