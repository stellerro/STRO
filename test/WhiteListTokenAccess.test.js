let createWhiteListTokenAccessTest = require('./WhiteListTokenAccess.behaviour');

const WhiteListTokenAccessTestable = artifacts.require('WhiteListTokenAccessTestable');
contract('WhiteListTokenAccess basic tests',createWhiteListTokenAccessTest.createWhiteListTokenAccessTest(WhiteListTokenAccessTestable));
