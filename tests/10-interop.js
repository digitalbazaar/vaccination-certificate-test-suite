/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const vpqr = require('@digitalbazaar/vpqr');

import * as chai from 'chai';
import Implementation from './implementation.cjs';
import {testCredential} from './assertions.js';
import certificates from '../certificates.cjs';
import allVendors from '../implementations.cjs';
import {documentLoader} from './loader.js';

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

describe('Vaccine Credentials', function() {
  const summaries = new Set();
  this.summary = summaries;
  for(const certificate of certificates) {
    describe(certificate.name, function() {
      // column names for the matrix go here
      const columnNames = [];
      const reportData = [];
      const images = [];
      // this will tell the report
      // to make an interop matrix with this suite
      this.matrix = true;
      this.report = true;
      this.columns = columnNames;
      this.rowLabel = 'Issuer';
      this.columnLabel = 'Verfier';
      // this will be displayed under the test title
      this.reportData = reportData;
      this.images = images;

      // this is the credential for the verifier tests
      let credential = null;
      for(const issuer of implementations) {
        describe(issuer.name, function() {
          before(async function() {
            try {
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
            const vp = {
              '@context': 'https://www.w3.org/2018/credentials/v1',
              type: 'VerifiablePresentation',
              verifiableCredential: credential
            };
            const {payload, imageDataUrl} = await vpqr.toQrCode(
              {vp, documentLoader});
            should.exist(payload, 'Expected there to be a qr payload');
            should.exist(imageDataUrl, 'Expected QR Code data url');
            const {vp: actualVP} = await vpqr.fromQrCode({
              text: payload,
              documentLoader,
              //diagnose: console.log
            });
            should.exist(actualVP);
            actualVP.should.be.an(
              'object', 'Expected actualVP to be an object');
            actualVP.should.eql(vp);
            // use the DB Data in the test suite
            if(issuer.name === 'Digital Bazaar') {
              reportData[0] = JSON.stringify(credential, null, 2);
              images[0] = imageDataUrl;
            }
          });
          // this sends a credential issued by the implementation
          // to each verifier
          for(const verifier of implementations) {
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
            });
          }
        });
      }
    });
  }
  after(function() {
    // add summary of certificates and implementations used
    summaries.add(
      'This suite issued & verified vaccine credentials for' +
         ` ${certificates.length} vaccines.`);
    summaries.add(`These credentials were issued & verified by` +
        ` ${implementations.length} implementations.`);
  });
});
