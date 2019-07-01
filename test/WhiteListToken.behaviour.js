let expectThrow = require('./helpers/expectThrow');
let latestTime = require('./helpers/latestTime');
const { increaseTimeTo, duration } = require('./helpers/increaseTime');
const {inLogs,inTransaction} = require('./helpers/expectEvent');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function createWhiteListTokenTest(contractCls){
    return async function(accounts){
      let owner = accounts[0];
      let minter = accounts[1];
      let otherUser = accounts[2];
      let token;

      beforeEach(async () => {
          token = await contractCls.new(2000, { from: owner });
      });

      describe('basic tests', function () {

        it('creator should be token owner', async function () {
          const tokenOwner = await token.owner({ from: owner });
          tokenOwner.should.equal(owner);
        });

        it('owner can initially mint', async () => {
          var result = await token.mint(owner, 10, { from: owner });
          var balance = await token.balanceOf(owner);
          assert.equal(balance, 10);
        })

        it('minter can initially mint', async () => {
          await token.addMinter(minter, { from: owner });
          var result = await token.mint(owner, 10, { from: minter });
          var balance = await token.balanceOf(owner);
          assert.equal(balance, 10);
        })

        it('other user cannot mint tokens', async () => {
          await expectThrow.expectThrow(token.mint(owner, 10, { from: otherUser }));
        })

      });

      describe('when the token minting is not finished', function () {
        it('returns false for mintingFinished', async function () {
          const mintingFinished = await token.mintingFinished();
          assert.equal(mintingFinished, false);
        });
      });

      describe('when the token is minting finished', function () {
        beforeEach(async function () {
          await token.finishMinting({ from: owner });
        });

        it('returns true for mintingFinished', async function () {
          const mintingFinished = await token.mintingFinished();
          assert.equal(mintingFinished, true);
        });
      });

      describe('finish minting', function () {
        describe('when the sender is the token owner', function () {

          describe('when the token minting was not finished', function () {
            it('finishes token minting', async function () {
              await token.finishMinting({ from: owner });
              const mintingFinished = await token.mintingFinished();
              assert.equal(mintingFinished, true);
            });

            it('emits a mint finished event', async function () {
              const { logs } = await token.finishMinting({ from: owner });
              assert.equal(logs.length, 1);
              assert.equal(logs[0].event, 'MintFinished');
            });

            describe('when the token minting was already finished', function () {
              beforeEach(async function () {
                await token.finishMinting({ from: owner });
              });

              it('reverts', async function () {
                await expectThrow.expectThrow(token.finishMinting({ from: owner }));
              });
            });
          });

          describe('when the sender is not the token owner', function () {

            describe('when the token minting was not finished', function () {
              it('reverts', async function () {
                var res = await token.isMinter(otherUser, { from: otherUser });
                await expectThrow.expectThrow(token.finishMinting({ from: otherUser }));
              });
            });
          });
        });

        describe('mint', function () {
          const amount = 100;

          describe('when the sender has minting permission', function () {

            beforeEach(async function () {
              await token.addMinter(minter, { from: owner });
            });

            describe('when the token minting is not finished', function () {
              it('mints the requested amount', async function () {
                await token.mint(minter, amount, { from: minter });

                const balance = await token.balanceOf(minter);
                assert.equal(balance, amount);
              });
            });

            describe('when the token minting is finished', function () {
              beforeEach(async function () {
                await token.finishMinting({ from: owner });
              });

              it('reverts', async function () {
                await expectThrow.expectThrow(token.mint(owner, amount, { from: owner }));
              });
            });
          });

          describe('when the sender do not have minting permission', function () {

            describe('when the token minting is not finished', function () {
              it('reverts', async function () {
                await expectThrow.expectThrow(token.mint(owner, amount, { from: otherUser }));
              });
            });

            describe('when the token minting is already finished', function () {
              beforeEach(async function () {
                await token.finishMinting({ from: owner });
              });

              it('reverts', async function () {
                await expectThrow.expectThrow(token.mint(owner, amount, { from: otherUser }));
              });
            });
          });
        }); // describe mint

        describe('burn', function () {
          const amount = 100;

          it('burn is accessible to the owner', async function () {
            await token.mint(owner, amount, { from: owner });
            const { logs } = await  token.burn(amount, { from: owner });
            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'Transfer');
          });

          it('burn is not accessible to non owner', async function () {
            await token.mint(otherUser, amount, { from: owner });
            await expectThrow.expectThrow(token.burn(amount, { from: otherUser }));
          });

          it('burnFrom is accessible to the owner', async function () {
            await token.mint(minter, amount, { from: owner });
            await token.increaseAllowance(owner, amount, { from: minter });
            const { logs } = await  token.burnFrom(minter, amount, { from: owner });
            let balance = await token.balanceOf(minter);
            assert.equal(logs.length, 2);
            assert.equal(logs[1].event, 'Approval');
            assert.equal(balance, 0);
          });

          it('burnFrom is not accessible to non owner', async function () {
            await token.mint(minter, amount, { from: owner });
            await token.increaseAllowance(otherUser, amount, { from: minter });
            await expectThrow.expectThrow(token.burnFrom(minter, amount, { from: otherUser }));
          });

          describe('when the sender has burning permission', function () {
            describe('when user has enough funds to be burnt', function () {

              beforeEach(async function () {
                await token.mint(otherUser, amount, { from: owner });
                await token.increaseAllowance(owner, amount, { from: otherUser });
              });

              it('burns the requested amount', async function () {
                await token.burnFrom(otherUser, amount, { from: owner });

                const balance = await token.balanceOf(otherUser);
                assert.equal(balance, 0);
              });

            });

            describe('when user does not have sufficient funds to to be burnt', function () {
              beforeEach(async function () {
                await token.mint(otherUser, amount, { from: owner });
                await token.increaseAllowance(owner, amount-10, { from: otherUser });
              });

              it('reverts', async function () {
                await expectThrow.expectThrow(token.burnFrom(otherUser, amount, { from: owner }));
              })
            });

            describe('when the sender does not have burning permission', function () {
              describe('when user has enough funds to burn', function () {
                beforeEach(async function () {
                  await token.mint(minter, amount, { from: owner });
                });
                it('revert', async function () {
                  await expectThrow.expectThrow(token.burnFrom(minter, amount, { from: otherUser }));
                });
              });
            });

          });
        }); // describe burn

        describe('transfer wrapper tests', function () {

        describe('transfer & mint',function(){
            beforeEach(async () => {
                await token.addMinter(minter, { from: owner });

                await token.addKYClisted(otherUser, {from:owner});
                await token.addKYClisted(minter, {from:owner});
                await token.addKYClisted(owner, {from:owner});

                await token.mint(otherUser, 101);
                await token.mint(minter, 200);
                await token.mint(owner, 100);
            })
            it('no transfer before finish minting',async function(){
                await expectThrow.expectThrow(token.transfer(otherUser,50,{ from: minter }));
            });

            it('no transferFrom before finish minting',async function(){
                let balance = await token.balanceOf(otherUser);
                await token.increaseAllowance(minter, balance, { from: otherUser });

                await expectThrow.expectThrow(token.transferFrom(otherUser,owner,1,{ from: minter }));
            });

            describe('after finished minting',function(){
                beforeEach(async () => {
                    await token.finishMinting({ from: owner });
                });

                it('transfer after finish minting - success',async function(){
                    let balance = await token.balanceOf(minter);
                    let canBuy = await token.test_canInvestorBuy(otherUser)
                    let canSell = await token.test_canInvestorSell(minter)
                    assert.equal(true,canBuy,"Can buy");
                    assert.equal(true,canSell,"Can sell");

                    await token.transfer(otherUser,1,{ from: minter });
                });

                it('transferFrom after finish minting - success',async function(){
                    let balance = await token.balanceOf(otherUser);
                    await token.increaseAllowance(minter, balance, { from: otherUser });

                    await token.transferFrom(otherUser,owner,1,{ from: minter });
                    balance = await token.balanceOf(otherUser);
                    let ownerBalance = await token.balanceOf(owner);
                    assert.equal(balance,100);
                    assert.equal(ownerBalance,101);
                });

                it('no transfer if token paused',async function(){
                    await token.pause({ from: owner });
                    await expectThrow.expectThrow(token.transfer(otherUser,50,{ from: minter }));
                });

                it('transfer if token unpaused - success',async function(){
                    await token.pause({ from: owner });
                    await expectThrow.expectThrow(token.transfer(otherUser,50,{ from: minter }));
                    await token.unpause({ from: owner });
                    await token.transfer(otherUser,1,{ from: minter });

                    let balance1 = await token.balanceOf(otherUser);
                    let balance2 = await token.balanceOf(minter);
                    assert.equal(balance1,102);
                    assert.equal(balance2,199);
                });

                it('no transferFrom if token paused',async function(){
                    await token.pause({ from: owner });
                    let balance = await token.balanceOf(otherUser);
                    await token.increaseAllowance(minter, balance, { from: otherUser });
                    await expectThrow.expectThrow(token.transferFrom(otherUser,owner,1,{ from: minter }));
                });

                it('transferFrom if token unpaused - success',async function(){
                    await token.pause({ from: owner });
                    await expectThrow.expectThrow(token.transferFrom(otherUser,owner,1,{ from: minter }));
                    await token.unpause({ from: owner });

                    let balance = await token.balanceOf(otherUser);
                    await token.increaseAllowance(minter, balance, { from: otherUser });

                    await token.transferFrom(otherUser,owner,1,{ from: minter });
                    balance = await token.balanceOf(otherUser);
                    let ownerBalance = await token.balanceOf(owner);
                    assert.equal(balance,100);
                    assert.equal(ownerBalance,101);
                });

            });
        }); //describe('transfer & mint'

        describe('approve & mint',function(){
            beforeEach(async () => {
                await token.addMinter(minter, { from: owner });
            })
            it('no approve & mint after finish minting',async function(){
                await token.finishMinting({ from: owner });
                await expectThrow.expectThrow(token.approveAndMint(otherUser,50,{ from: minter }));
            });

            it('approve & mint before finish minting - success',async function(){
                await token.addKYCAdmin(minter, {from:owner});
                await token.approveAndMint(otherUser,50,{ from: minter });
                let balance = await token.balanceOf(otherUser);
                let canBuy = await token.test_canInvestorBuy(otherUser)
                let canSell = await token.test_canInvestorSell(otherUser)

                assert.equal(balance,50);
                assert.equal(true,canBuy,"Can buy");
                assert.equal(true,canSell,"Can sell");
            });

            it('no approve & mint before finish minting for non KYC admin',async function(){
                await expectThrow.expectThrow(token.approveAndMint(otherUser,50,{ from: minter }));
            });

            it('no approve & mint before finish minting for non minter',async function(){
                await token.addKYCAdmin(otherUser, {from:owner});
                await expectThrow.expectThrow(token.approveAndMint(minter,50,{ from: otherUser }));
            });
        });

        describe('restore tokens',function(){
          beforeEach(async () => {
              await token.addMinter(minter, { from: owner });

              await token.addKYClisted(minter, {from:owner});
              await token.addKYClisted(owner, {from:owner});

              await token.mint(minter, 200);
              await token.mint(owner, 100);
          })

          it('owner can restore tokens',async function(){
              await token.addKYClisted(otherUser, {from:owner});
              await token.restoreTokens(minter, otherUser, {from:owner})
              let oldAddressBalance = await token.balanceOf(minter);
              let newAddressBalance = await token.balanceOf(otherUser);

              assert.equal(oldAddressBalance,0);
              assert.equal(newAddressBalance,200);
          });

          it('non owner cannot restore tokens',async function(){
              await token.addKYClisted(otherUser, {from:owner});
              await token.mint(otherUser, 100);
              await expectThrow.expectThrow(token.restoreTokens(otherUser, owner, {from:minter}));
          });

          it('owner can restore tokens to non KYC listed',async function(){
              await token.restoreTokens(minter, otherUser, {from:owner});

              let oldAddressBalance = await token.balanceOf(minter);
              let newAddressBalance = await token.balanceOf(otherUser);

              assert.equal(oldAddressBalance,0);
              assert.equal(newAddressBalance,200);
          });

          it('owner cannot restore tokens if token is paused',async function(){
              await token.pause({ from: owner });
              await expectThrow.expectThrow(token.restoreTokens(minter, otherUser, {from:owner}));
          });

          it('restore tokens if token is unpaused - success',async function(){
              await token.pause({ from: owner });
              await expectThrow.expectThrow(token.restoreTokens(minter, otherUser, {from:owner}));
              await token.unpause({ from: owner });

              await token.restoreTokens(minter, otherUser, {from:owner});

              let oldAddressBalance = await token.balanceOf(minter);
              let newAddressBalance = await token.balanceOf(otherUser);

              assert.equal(oldAddressBalance,0);
              assert.equal(newAddressBalance,200);

          });
        });

        describe('transfer scenarios', function () {
          const amount = 100;
          beforeEach(async function () {
              await token.addMinter(minter, { from: owner });

              await token.addKYClisted(otherUser, {from:owner});
              await token.addKYClisted(minter, {from:owner});

              await token.mint(otherUser, amount, { from: owner });
              await token.finishMinting({ from: owner });
          });

          describe('transfering whole balance', function () {

            it('basic transfer', async function () {
                await token.transfer(minter, amount, { from: otherUser });
                let otherUserBalance = await token.balanceOf(otherUser);
                let minterBalance = await token.balanceOf(minter);
                assert.equal(otherUserBalance, 0);
                assert.equal(minterBalance, amount);
            })

            describe('when transfering investor and receiver are same', function () {
                it('success', async function () {
                    let balanceBefore = await token.balanceOf(otherUser);
                    await token.transfer(otherUser, amount, { from: otherUser });
                    let balanceAfter = await token.balanceOf(otherUser);
                    assert.equal(balanceBefore.toNumber(), balanceAfter.toNumber());
                })
            });
          });

          describe('transfering half of investors balance', function () {
              it('basic transfer', async function () {
                  await token.transfer(minter, amount / 2, { from: otherUser });
                  let otherUserBalance = await token.balanceOf(otherUser);
                  let minterBalance = await token.balanceOf(minter);
                  assert.equal(otherUserBalance, amount / 2);
                  assert.equal(minterBalance, amount / 2);
              })

              describe('when transfering investor and receiver are the same', function () {
                  it('success', async function () {
                      let balanceBefore = await token.balanceOf(otherUser);
                      await token.transfer(otherUser, amount / 2, { from: otherUser });
                      let balanceAfter = await token.balanceOf(otherUser);
                      assert.equal(balanceBefore.toNumber(), balanceAfter.toNumber());
                  });
              });
          });

          describe('transfering more than available in balance', function () {
            it('basic transfer', async function () {
                await expectThrow.expectThrow(token.transfer(minter, amount * 2, { from: otherUser }));
            })
          });

          describe('when investors have changing attributes', function () {
            describe('when receiver investor is not white listed', function () {
                it('reverts', async function () {
                    await token.removeKYClisted(minter, { from: owner });
                    await expectThrow.expectThrow(token.transfer(minter, amount, { from: otherUser }));
                })
            });
          });

        }); //transfer scenarios

      }); //transfer wrapper tests
    }); // describe finishMinting

  }
}

module.exports.createWhiteListTokenTest = createWhiteListTokenTest;
