const Registry = artifacts.require("Registry");
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

  it("Perform Calling", async() => {
    await registryContract.setPrice(mockToken.address, 100, { from: receiverAccount })
    let val = await registryContract.getPrice.call(receiverAccount, mockToken.address)
    assert.equal((new BigNumber(val)).toString(), "100", "improper price")

    //put calling account on callist
    //await registryContract.addToCallList(callingAccount, { from: receiverAccount });

    //calling account calls
    let trx = await registryContract.call(receiverAccount, mockToken.address, { from: callingAccount })
    console.log("Calling: \n" + callingAccount + " ----> " + receiverAccount)
    exec(VOIP + " --connect 127.0.0.1:3333", (error, stdout, stderr) => {
//      console.log("error: " + error)
//      console.log("out: " + stdout)
//      console.log("stderr: " + stderr)
    })

    //sleep so that the balance can be viewed online if desired
    //execSync("sleep 10")

    //receiving account is listening and answers
    let caller
    await truffleAssert.eventEmitted(trx, 'IncomingCall', (ev) => {
      console.log("Incoming call from: " + ev.caller)
      caller = ev.caller
      return true
    })


    //receiver account answers the caller
    trx  = await registryContract.answer(caller, { from: receiverAccount })

    await truffleAssert.eventEmitted(trx, 'AnswerCall', (ev) => {
      if (ev.receiver !== receiverAccount) return false;
      if (ev.caller !== callingAccount) return false;

      console.log("Call Answered: \n" + receiverAccount + " <---- " + ev.caller)
      execSync(VOIP + " --listen 3333", (error, stdout, stderr) => {
//        console.log("error: " + error)
//        console.log("out: " + stdout)
//        console.log("stderr: " + stderr)
      })
      return true;
    })
  })
});
