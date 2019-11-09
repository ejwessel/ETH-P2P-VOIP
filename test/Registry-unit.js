const Registry = artifacts.require("Registry");
const helper = require('ganache-time-traveler');
const truffleAssert = require('truffle-assertions');

contract('Registry Test', async (accounts) => {
  let calleeAccount = accounts[1]
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
      let price = await registryContract.getPrice(calleeAccount, token)
      assert.equal(price.toNumber(), 0, "invalid price set")
    })
    
    it("test setPrice()", async () => {
      let priceToSet = 300
      await registryContract.setPrice(token, priceToSet, { from: calleeAccount });
      let price = await registryContract.getPrice(calleeAccount, token)
      assert.equal(price.toNumber(), price, "invalid price set")
    })

    it("test canCall()", async () => {
      let val = await registryContract.canCall(calleeAccount, callingAccount)
      assert.equal(val, false, "invalid call permissions")
    })

    it("test addToWhitelist()", async () => {
      await registryContract.addToWhitelist(callingAccount, { from: calleeAccount })
      let val = await registryContract.canCall(callingAccount, calleeAccount)
      assert.equal(val, true, "invalid call permissions")
    })

    it("test removeFromWhitelist()", async () => {
      await registryContract.addToWhitelist(callingAccount, { from: calleeAccount })
      let before = await registryContract.canCall(callingAccount, calleeAccount)
      assert.equal(before, true, "invalid call permissions")

      await registryContract.removeFromWhitelist(callingAccount, { from: calleeAccount })
      let after = await registryContract.canCall(callingAccount, calleeAccount)
      assert.equal(after, false, "invalid call permissions")
    })
  })
});
