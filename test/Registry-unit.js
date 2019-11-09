const Registry = artifacts.require("Registry");
const helper = require('ganache-time-traveler');
const truffleAssert = require('truffle-assertions');
const MockContract = artifacts.require("MockContract");
const ERC20 = artifacts.require("ERC20Mintable")
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('Registry Test', async (accounts) => {
  let receiverAccount = accounts[1]
  let callingAccount = accounts[2]
  let mockToken
  let registryContract
  let snapshotId

  beforeEach(async() => {
    let snapShot = await helper.takeSnapshot();
    snapshotId = snapShot['result'];
  });

  afterEach(async() => {
    await helper.revertToSnapshot(snapshotId);
  });

  before(async() => {
    registryContract = await Registry.new();

    mockToken = await MockContract.new();
    let mockTokenTemplate = await ERC20.new();
    let mockToken_transferFrom = await mockTokenTemplate.contract.methods
      .transferFrom(EMPTY_ADDRESS, EMPTY_ADDRESS, 0)
      .encodeABI()
    await mockToken.givenMethodReturnBool(mockToken_transferFrom, true)
  });

  describe("Test", async () => {
    it("test getPrice()", async () => {
      let price = await registryContract.getPrice(receiverAccount, mockToken.address)
      assert.equal(price.toNumber(), 0, "invalid price set")
    })
    
    it("test setPrice()", async () => {
      let priceToSet = 300
      let trx = await registryContract.setPrice(mockToken.address, priceToSet, { from: receiverAccount });
      let price = await registryContract.getPrice(receiverAccount, mockToken.address)
      assert.equal(price.toNumber(), price, "invalid price set")

      await truffleAssert.eventEmitted(trx, 'PriceSet', (ev) => {
        return ev.receiver === receiverAccount && ev.mockToken === mockToken.address, ev.price.toNumber() === priceToSet
      })
    })

    it("test canCall()", async () => {
      let val = await registryContract.canCall(receiverAccount, callingAccount)
      assert.equal(val, false, "invalid call permissions")
    })

    it("test addToCallList()", async () => {
      let trx = await registryContract.addToCallList(callingAccount, { from: receiverAccount })
      let val = await registryContract.canCall(callingAccount, receiverAccount)
      assert.equal(val, true, "invalid call permissions")

      await truffleAssert.eventEmitted(trx, 'CallListAdded', (ev) => {
        return ev.receiver === receiverAccount && ev.caller === callingAccount
      })
    })

    it("test removeFromCallList()", async () => {
      await registryContract.addToCallList(callingAccount, { from: receiverAccount })
      let before = await registryContract.canCall(callingAccount, receiverAccount)
      assert.equal(before, true, "invalid call permissions")

      let trx = await registryContract.removeFromCallList(callingAccount, { from: receiverAccount })
      let after = await registryContract.canCall(callingAccount, receiverAccount)
      assert.equal(after, false, "invalid call permissions")

      await truffleAssert.eventEmitted(trx, 'CallListRemoved', (ev) => {
        return ev.receiver === receiverAccount && ev.caller === callingAccount
      })
    })

    it("test call() when caller is whitelited", async() => {

      //set price of receiver
      await registryContract.setPrice(mockToken.address, 100, { from: receiverAccount })

      //calling account calls
      let trx = await registryContract.call(receiverAccount, mockToken.address, { from: callingAccount })
      await truffleAssert.eventEmitted(trx, 'IncomingCall', (ev) => {
        return ev.receiver === receiverAccount && ev.caller === callingAccount
      })
    })

    it("test call() when caller is not whitelisted", async() => {

    })
  })
});
