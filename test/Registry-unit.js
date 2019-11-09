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
  let mockToken_transferFrom 
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

    //mock transferFrom
    mockToken_transferFrom = await mockTokenTemplate.contract.methods
      .transferFrom(EMPTY_ADDRESS, EMPTY_ADDRESS, 0)
      .encodeABI()
    await mockToken.givenMethodReturnBool(mockToken_transferFrom, true)

    //mock transfer
    mockToken_transfer = await mockTokenTemplate.contract.methods
      .transfer(EMPTY_ADDRESS, 0)
      .encodeABI()
    await mockToken.givenMethodReturnBool(mockToken_transfer, true)
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
  })

  describe("test call list", async() => {
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
  })

  describe("Test call()", async() => {
    it("test call() when caller is on call list", async() => {
      //put calling account on calllist
      await registryContract.addToCallList(callingAccount, { from: receiverAccount });

      //calling account calls
      let trx = await registryContract.call(receiverAccount, mockToken.address, { from: callingAccount })
      await truffleAssert.eventEmitted(trx, 'IncomingCall', (ev) => {
        return ev.receiver === receiverAccount
          && ev.caller === callingAccount 
          && ev.token === mockToken.address
      })

      //inspect invocation of transferFrom
      let invocationCount = await mockToken.invocationCountForMethod.call(mockToken_transferFrom)
      assert.equal(invocationCount.toNumber(), 0, "invalid transferFrom call")
    })

    it("test call() when caller is not on call list", async() => {
      //set price of receiver
      await registryContract.setPrice(mockToken.address, 100, { from: receiverAccount })

      //calling account calls
      let trx = await registryContract.call(receiverAccount, mockToken.address, { from: callingAccount })
      await truffleAssert.eventEmitted(trx, 'IncomingCall', (ev) => {
        return ev.receiver === receiverAccount 
          && ev.caller === callingAccount 
          && ev.token === mockToken.address
      })

      //inspect invocation of transferFrom
      let invocationCount = await mockToken.invocationCountForMethod.call(mockToken_transferFrom)
      assert.equal(invocationCount.toNumber(), 1, "missing transferFrom call")
    })
  })

  describe("Test answer()", async() => {
    it("test answer() when caller is on call list", async() => {
      //put calling account on callist
      await registryContract.addToCallList(callingAccount, { from: receiverAccount });

      //calling account calls
      await registryContract.call(receiverAccount, mockToken.address, { from: callingAccount })

      let trx = await registryContract.answer(callingAccount, { from: receiverAccount });
      await truffleAssert.eventEmitted(trx, 'AnswerCall', (ev) => {
        return ev.receiver === receiverAccount && ev.caller === callingAccount
      })

      //inspect invocation of transfer
      let invocationCount = await mockToken.invocationCountForMethod.call(mockToken_transfer)
      assert.equal(invocationCount.toNumber(), 0, "invalid transfer call")
    })

    it("test answer() when caller is not on call list", async() => {
      //calling account calls
      await registryContract.call(receiverAccount, mockToken.address, { from: callingAccount })

      let trx = await registryContract.answer(callingAccount, { from: receiverAccount });
      await truffleAssert.eventEmitted(trx, 'AnswerCall', (ev) => {
        return ev.receiver === receiverAccount && ev.caller === callingAccount
      })

      //inspect invocation of transfer
      let invocationCount = await mockToken.invocationCountForMethod.call(mockToken_transfer)
      assert.equal(invocationCount.toNumber(), 1, "invalid transfer call")
    })

    it("test answer() when call has expired", async() => {
      //calling account calls
      await registryContract.call(receiverAccount, mockToken.address, { from: callingAccount })

      await helper.advanceTimeAndBlock(500)

      await truffleAssert.reverts(
        registryContract.answer(callingAccount, { from: receiverAccount }),
        "Call is no longer valid"
      );
    })
  })
});
