pragma solidity 0.5.12;

contract Registry {

  event CallListAdded(address, address);
  event CallListRemoved(address, address);

  //mapping of callee address to the caller address and a 
  //boolean value that determines if callee can be called
  //true means they can call, everybody defaults to false
  mapping(address => mapping(address => bool)) public callList;

  //mapping of callee address to token to price
  mapping(address => mapping(address => uint256)) public pricing;

  function getPrice(address account, address token) external view returns(uint256) {
   return pricing[account][token];
  }
  
  function setPrice(address token, uint256 price) external {
    pricing[msg.sender][token] = price;
  }

  function canCall(address caller, address callee) external view returns(bool) {
    return callList[callee][caller];
  }

  function addToCallList(address accountToAdd) external {
    callList[msg.sender][accountToAdd] = true;
    emit CallListAdded(msg.sender, accountToAdd);
  }

  function removeFromCallList(address accountToRemove) external {
    delete callList[msg.sender][accountToRemove];
    emit CallListRemoved(msg.sender, accountToRemove);
  }
}
