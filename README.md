# Vaccination Certificate Test Suite

A few of the members in the W3C Credentials Community Group have been 
working on a 
[Vaccination Certificate Vocabulary](https://w3c-ccg.github.io/vaccination-vocab/). 
The World Health Organization has recently published a Release 
Candidate data model dictionary for 
[Smart Vaccination Cards](https://www.who.int/publications/m/item/interim-guidance-for-developing-a-smart-vaccination-certificate). 
The CCG has also been working on a 
[Verifiable Credentials HTTP API](https://github.com/w3c-ccg/vc-http-api).

The WHO guidance covers 28 types of vaccines that we (as a global society) depend on, including Measles, Smallpox, Polio, Yellow Fever, COVID-19, and others. We (Digital Bazaar) thought it might be interesting to see if we could create an interoperability test suite for the WHO Smart Vaccination Card work using the tools listed above.

Please note:

* This is all experimental; it's not meant to step on any toes (the 40+ other vaccination certificate projects).
* We have privacy concerns wrt. the WHO guidance and one way to address those is to put better options into the ecosystem.
* There is no guarantee that WHO will follow any particular path at this moment.
* Digital Bazaar is not operating on behalf of any of our customers, this is a self-funded internal "try to make the world a better place" project. It is apolitical. All mistakes and missteps are ours, not anyone else that could be construed as being a part of the work.

With that said, we've been able to achieve the following:

* A test suite containing 1,624 tests covering the 28 vaccine types in the WHO vocabulary.
* 7 independent vendor implementations issuing and verifying each others WHO Smart Vaccination Cards.
* 1,623 passing tests demonstrating true interoperability!

The test report output can be found here:

https://w3id.org/vaccination/interop-reports

## Install

Installation is pretty simple:

1. install the node_modules
2. Clone the who svc repo
3. generate the latest certificates

The following commands should do the above:
```
npm i
npm run fetch-who-int-svc
npm run generate-certificates
```
