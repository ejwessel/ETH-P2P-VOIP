pragma solidity 0.5.12;

contract Registry {

  event CallListAdded(address receiver, address caller);
  event CallListRemoved(address receiver, address caller);
  event PriceSet(address receiver, address token, uint256 price);

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

  function canCall(address caller, address receiver) external view returns(bool) {
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
}
