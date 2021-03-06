/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as chai from 'chai';

const should = chai.should();

/**
 * Tests the properties of a credential.
 *
 * @param {object} credential - A Vc issued from an issuer.
 *
 * @returns {undefined} Just returns on success.
 */
export const testCredential = credential => {
  should.exist(credential, 'expected credential to exist');
  credential.should.be.an('object');
  credential.should.have.property('@context');
  // NOTE: some issuers add a revocation list context to the types
  credential['@context'].should.include(
    'https://www.w3.org/2018/credentials/v1');
  credential['@context'].should.include('https://w3id.org/vaccination/v1');
  credential.should.have.property('type');
  credential.type.should.eql([
    'VerifiableCredential',
    'VaccinationCertificate'
  ]);
  credential.should.have.property('id');
  credential.id.should.be.a('string');
  credential.should.have.property('name');
  credential.name.should.be.a('string');
  credential.should.have.property('description');
  credential.description.should.be.a('string');
  credential.should.have.property('credentialSubject');
  credential.credentialSubject.should.be.an('object');
  credential.should.have.property('issuanceDate');
  credential.issuanceDate.should.be.a('string');
  credential.should.have.property('expirationDate');
  credential.expirationDate.should.be.a('string');
  credential.should.have.property('issuer');
  credential.issuer.should.be.a('string');
  credential.should.have.property('proof');
  credential.proof.should.be.an('object');
};

