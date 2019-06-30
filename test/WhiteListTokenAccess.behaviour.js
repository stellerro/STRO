let expectThrow = require('./helpers/expectThrow');

function createWhiteListTokenAccessTest(contractCls){
    return async function(accounts){
        let admin = accounts[0];
        let user1 = accounts[1];
        let user2 = accounts[2];
        let accessList;

        beforeEach(async () => {
            accessList = await contractCls.new({from: admin});
        });

        describe('Owner related tests', function () {
          /**
           * Owner related tests
           */
          it('verify admin address is the owner' ,async () => {
              let owner = await accessList.owner();
              assert.equal(owner,admin);
          });

          it('verify admin address returns from isOwner' ,async () => {
              let result = await accessList.isOwner();
              assert.equal(result,true);
          });

          it('verify non owner user is not the owner' ,async () => {
              let result = await accessList.isOwner({from:user1});
              assert.equal(result,false);
          });
        });

        describe('KYC admins related tests', function () {
          /**
           * KYC admins related tests
           */
          it('verify admin is also a kyc admin' ,async () => {
              let result = await accessList.isKYCAdmin(admin);
              assert.equal(result,true);
          });

          it('verify owner can add user as kyc admin' ,async () => {
              await accessList.addKYCAdmin(user1, {from:admin});
              let result = await accessList.isKYCAdmin(user1);
              assert.equal(result,true);
          });

          it('verify kyc admin cannot add user as kyc admin' ,async () => {
              await accessList.addKYCAdmin(user1, {from:admin});
              await expectThrow.expectThrow(accessList.addKYCAdmin(user2, {from:user1}));
              // let result = await accessList.isKYCAdmin(user2);
              // assert.equal(result,true);
          });

          it('verify owner can remove user as kyc admin' ,async () => {
            await accessList.addKYCAdmin(user1, {from:admin});
            await accessList.test_removeKYCAdmin(user1, {from:admin});
            let result = await accessList.isKYCAdmin(user1);
            assert.equal(result,false);
          });

          it('verify not owner cannot remove a kyc admin' ,async () => {
            await accessList.addKYCAdmin(user1, {from:admin});
            await expectThrow.expectThrow(accessList.test_removeKYCAdmin(admin, {from:user1}));
          });

          it('verify revert if non KYC admin user try to add a KYC admin' ,async () => {
              await expectThrow.expectThrow(accessList.addKYCAdmin(user2, {from:user1}));
          });
        });

        describe('KYC listed related tests', function () {
          /**
           * KYC listed related tests
           */

           it('verify owner can add user as kyc listed' ,async () => {
               await accessList.addKYClisted(user1, {from:admin});
               let result = await accessList.isKYClisted(user1);
               assert.equal(result,true);
           });

           it('verify kyc admin can add user as kyc listed' ,async () => {
               await accessList.addKYCAdmin(user1, {from:admin});
               await accessList.addKYClisted(user2, {from:user1});
               let result = await accessList.isKYClisted(user2);
               assert.equal(result,true);
           });

           it('verify non kyc admin cannot add user as kyc listed' ,async () => {
               await expectThrow.expectThrow(accessList.addKYClisted(user2, {from:user1}));
           });

           it('verify owner can remove user as kyc listed' ,async () => {
             await accessList.addKYClisted(user1, {from:admin});
             await accessList.removeKYClisted(user1, {from:admin});
             let result = await accessList.isKYCAdmin(user1);
             assert.equal(result,false);
           });

           it('verify kyc admin can remove user as kyc listed' ,async () => {
             await accessList.addKYCAdmin(user1, {from:admin});
             await accessList.addKYClisted(user2, {from:admin});
             await accessList.removeKYClisted(user2, {from:user1});
             let result = await accessList.isKYCAdmin(user2);
             assert.equal(result,false);
           });

         });
    }
}

module.exports.createWhiteListTokenAccessTest = createWhiteListTokenAccessTest;
