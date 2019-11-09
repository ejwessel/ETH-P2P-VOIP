pragma solidity 0.5.12;

contract Registry {

  event CallListAdded(address receiver, address caller);
  event CallListRemoved(address receiver, address caller);
  event PriceSet(address receiver, address token, uint256 price);
  event IncomingCall(address receiver, address caller, uint256 timestamp);
  event AnswerCall(address receiver, address caller, uint256 timestamp);

  struct PendingAmount {
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
      pendingAmount[msg.sender][receiver] = PendingAmount(pricing[receiver][token], currentTime); 

      //money is moved into the contract temporarily and is locked for a duration
      //token.transferFrom(msg.sender, this, pricing[receiver][token]);
    }

    //emit the call
    emit IncomingCall(receiver, msg.sender, currentTime);
  }

//  function answer(address caller) external {
//    if (!this.canCall(caller, msg.sender) {
//      PendingAmount pending = pendingAmount[caller][msg.sender]
//
//      //check if the call is still valid 1 minute limit?
//      //if (pending.timestamp + x > now)
//
//      //withdraw funds they would have paid
//      token.transfer(msg.sender, pending.amount);
//    }
//
//    //emit the answer
//    emit AnswerCall(caller, msg.sender, now)
//
//  }

  function withdraw(address token) external {
    //withdraw funds from the contract
  }
}
