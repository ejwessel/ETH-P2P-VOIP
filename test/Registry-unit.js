const Registry = artifacts.require("Registry");
const helper = require('ganache-time-traveler');
const truffleAssert = require('truffle-assertions');

contract('Registry Test', async (accounts) => {
  let receiverAccount = accounts[1]
  let callingAccount = accounts[2]
  let token = accounts[3]
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
  });

  describe("Test", async () => {
    it("test getPrice()", async () => {
      let price = await registryContract.getPrice(receiverAccount, token)
      assert.equal(price.toNumber(), 0, "invalid price set")
    })
    
    it("test setPrice()", async () => {
      let priceToSet = 300
      let trx = await registryContract.setPrice(token, priceToSet, { from: receiverAccount });
      let price = await registryContract.getPrice(receiverAccount, token)
      assert.equal(price.toNumber(), price, "invalid price set")

      truffleAssert.eventEmitted(trx, 'PriceSet', (ev) => {
        return ev.receiver === receiverAccount && ev.token === token, ev.price.toNumber() === priceToSet
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

      truffleAssert.eventEmitted(trx, 'CallListAdded', (ev) => {
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

      truffleAssert.eventEmitted(trx, 'CallListRemoved', (ev) => {
        return ev.receiver === receiverAccount && ev.caller === callingAccount
      })
    })
  })
});
