const Registry = artifacts.require("Registry");
const helper = require('ganache-time-traveler');
const truffleAssert = require('truffle-assertions');
const MockContract = artifacts.require("MockContract");
const ERC20 = artifacts.require("ERC20Mintable")
const BigNumber = require('bignumber.js')
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
const MAX_INT = new BigNumber("1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77")
const PRICE_TO_SET = new BigNumber("300")
const exec = require("child_process").exec
const execSync = require("child_process").execSync
const VOIP = "node ~/Dev/tvoip/Index.js"

contract('Mock Calling', async (accounts) => {
  let receiverAccount = accounts[1]
  let callingAccount = accounts[2]
  let nonExistentReceiver = accounts[3]
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

  describe("Perform Call", async() => {
    it("Perform Calling", async() => {
      //put calling account on calllist
      await registryContract.addToCallList(callingAccount, { from: receiverAccount });

      //calling account calls
      let trx = await registryContract.call(receiverAccount, mockToken.address, { from: callingAccount })

      await truffleAssert.eventEmitted(trx, 'IncomingCall', (ev) => {
        if (ev.receiver !== receiverAccount) return false;

        console.log("Calling...")
        exec(VOIP + " --connect 127.0.0.1:3333", (error, stdout, stderr) => {
          console.log("error: " + error)
          console.log("out: " + stdout)
          console.log("stderr: " + stderr)
        })

        console.log("Call Answered")
        execSync(VOIP + " --listen 3333", (error, stdout, stderr) => {
          console.log("error: " + error)
          console.log("out: " + stdout)
          console.log("stderr: " + stderr)
        })

        return true
      })
    })
  })
});
