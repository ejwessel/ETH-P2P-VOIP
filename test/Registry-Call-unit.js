const Registry = artifacts.require("Registry");
const truffleAssert = require('truffle-assertions');
const ERC20 = artifacts.require("ERC20Mintable")
const BigNumber = require('bignumber.js')
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
const MAX_INT = new BigNumber("1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77")
const TrueCAD_ADDRESS = "0x00000100F2A2bd000715001920eB70D229700085"
const PRICE_TO_SET = new BigNumber("300")
const exec = require("child_process").exec
const execSync = require("child_process").execSync
const VOIP = "node ~/Dev/tvoip/Index.js"

contract('Mock Calling', async (accounts) => {
  let receiverAccount = accounts[0]
  let callingAccount = accounts[0]
  let registryContract

  before(async() => {
    registryContract = await Registry.new();
    console.log(registryContract.address)
  });

  it("Perform Invalid Calling", async() => {
    await registryContract.setPrice(TrueCAD_ADDRESS, 100)
    await registryContract.call(
      "0x677248669EBc4FCAe9F1320eFfa0BE0324B3F942",
      TrueCAD_ADDRESS,
      { from: callingAccount }
    )
  })

  it("Perform Calling", async() => {
    //put calling account on calllist
    await registryContract.addToCallList(callingAccount, { from: receiverAccount });

    //calling account calls
    let trx = await registryContract.call(receiverAccount, TrueCAD_ADDRESS, { from: callingAccount })
    console.log("Calling: \n" + callingAccount + " ----> " + receiverAccount)
    exec(VOIP + " --connect 127.0.0.1:3333", (error, stdout, stderr) => {
      console.log("error: " + error)
      console.log("out: " + stdout)
      console.log("stderr: " + stderr)
    })


    //receiving account is listening and answers
    await truffleAssert.eventEmitted(trx, 'IncomingCall', (ev) => {
      if (ev.receiver !== receiverAccount) return false;
      console.log("Call Answered: \n" + receiverAccount + " <---- " + callingAccount)
      execSync(VOIP + " --listen 3333", (error, stdout, stderr) => {
        console.log("error: " + error)
        console.log("out: " + stdout)
        console.log("stderr: " + stderr)
      })

      return true
    })
  })
});
