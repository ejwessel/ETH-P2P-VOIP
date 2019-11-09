pragma solidity 0.5.12;

contract Registry {

  //mapping of callee address to the caller address and a 
  //boolean value that determines if callee can be called
  mapping(address => mapping(address => bool)) public whitelist;

  //mapping of callee address to token to price
  mapping(address => mapping(address => uint256)) public pricing;

  function getPrice(address account, address token) return uint256 {
   return pricing[account][token];
  }

  function canCall(address caller, address callee) return bool {
    return whitelist[callee][caller];
  }

  function addToWhitelist(address accountToAdd) {
    whitelist[msg.sender][accountToAdd] = true;
  }

  function removeFromWhitelist(address accountToRemove) {
    delete whitelist[msg.sender][accountToRemove];
  }
}
