let createWhiteListTokenTest = require('./WhiteListToken.behaviour');

const WhiteListTokenTestable = artifacts.require('WhiteListTokenTestable');
contract('WhiteListToken basic tests',createWhiteListTokenTest.createWhiteListTokenTest(WhiteListTokenTestable));
