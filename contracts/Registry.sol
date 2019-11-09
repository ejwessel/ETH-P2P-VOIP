pragma solidity 0.5.12;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract Registry {

  event CallListAdded(address receiver, address caller);
  event CallListRemoved(address receiver, address caller);
  event PriceSet(address receiver, address token, uint256 price);
  event IncomingCall(address receiver, address caller, address token, uint256 timestamp);
  event AnswerCall(address receiver, address caller, uint256 timestamp);

  uint256 constant pendingLimit = 2 minutes;

  struct PendingAmount {
    address token;
    uint256 amount;
    uint256 timestamp;
  }

  //address to token to amount that is pending
  //caller to receiver to PendingAmount
  mapping(address => mapping(address => PendingAmount)) public pendingAmount;

  //receiver to caller to can be called. everyone is defaulted to false
  mapping(address => mapping(address => bool)) public callList;

  //receiver to token to price. price of 0 is undefined
  mapping(address => mapping(address => uint256)) public pricing;

  function getPrice(address account, address token) external view returns(uint256) {
   return pricing[account][token];
  }
  
  function setPrice(address token, uint256 price) external {
    pricing[msg.sender][token] = price;
    emit PriceSet(msg.sender, token, price);
  }

  function canCall(address caller, address receiver) public view returns(bool) {
    return callList[receiver][caller];
  }

  function addToCallList(address accountToAdd) external {
    callList[msg.sender][accountToAdd] = true;
    emit CallListAdded(msg.sender, accountToAdd);
  }

  function removeFromCallList(address accountToRemove) external {
    delete callList[msg.sender][accountToRemove];
    emit CallListRemoved(msg.sender, accountToRemove);
  }

  function call(address receiver, address token) external {
    //Registry contract needs access to funds to move them
    uint256 currentTime = now;

    //if they're not allowed to call the receiver they need to pay
    if (!this.canCall(msg.sender, receiver)) {
      //keep track of how much can be withdrawn
      pendingAmount[msg.sender][receiver] = PendingAmount(token, pricing[receiver][token], currentTime); 

      //money is moved into the contract temporarily and is locked for a duration
      IERC20(token).transferFrom(msg.sender, address(this), pricing[receiver][token]);
    }

    //emit the call
    emit IncomingCall(receiver, msg.sender, token, currentTime);
  }

  function answer(address caller) external {
    if (!this.canCall(caller, msg.sender)) {
      PendingAmount memory pending = pendingAmount[caller][msg.sender];

      //check if the call is still valid pending limit?
      require(now < (pending.timestamp + pendingLimit), "Call is no longer valid");

      //withdraw funds they would have paid
      IERC20(pending.token).transfer(msg.sender, pending.amount);
    }

    //emit the answer
    emit AnswerCall(caller, msg.sender, now);
  }

//  function withdrawPending(address receiver, address token) external {
//    //withdraw funds from the contract if a call never went through
//    PendingAmount pending = pendingAmount[msg.sender][receiver]
//
//    require(now > (pending.timestamp + pendingLimit), "Call in progress")
//
//    //funds can be returned
//
//    //send money back to the caller
//    delete pendingAmount[msg.sender][receiver]
//    IERC20(token).transfer(msg.sender, pending.amount);
//  }
}
