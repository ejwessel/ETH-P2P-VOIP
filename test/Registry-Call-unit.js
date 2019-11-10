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
    //registryContract = await Registry.new();
    registryContract = await Registry.at("0x8f831Be87f4541C5BE706BAC1a8f0D4e53c9B7e3");
    console.log("Registry: " + registryContract.address)
  });

//  it("Test", async() => {
//    console.log("test")
//  })

  it("Perform Invalid Calling", async() => {
    let b = await registryContract.getPrice.call("0x677248669EBc4FCAe9F1320eFfa0BE0324B3F942", TrueCAD_ADDRESS)
    console.log((new BigNumber(b)).toString())

    //This should fail calling account does not have enough
    await truffleAssert.reverts(
      registryContract.call(
        "0x677248669EBc4FCAe9F1320eFfa0BE0324B3F942",
        TrueCAD_ADDRESS,
        { from: callingAccount }
      )
    )
  })

  it("Perform Calling", async() => {
    await registryContract.setPrice(TrueCAD_ADDRESS, 100)
    let val = await registryContract.getPrice.call(receiverAccount, TrueCAD_ADDRESS)
    assert.equal((new BigNumber(val)).toString(), "100", "improper price")

    //put calling account on callist
    //await registryContract.addToCallList(callingAccount, { from: receiverAccount });

    //calling account calls
    let trx = await registryContract.call(receiverAccount, TrueCAD_ADDRESS, { from: callingAccount })
    console.log("Calling: \n" + callingAccount + " ----> " + receiverAccount)
    exec(VOIP + " --connect 127.0.0.1:3333", (error, stdout, stderr) => {
//      console.log("error: " + error)
//      console.log("out: " + stdout)
//      console.log("stderr: " + stderr)
    })

    //sleep so that the balance can be viewed online if desired
    execSync("sleep 10")

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
