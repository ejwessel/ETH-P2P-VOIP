## &#9888; WARNING &#9888;
- Keep in mind this is a hackathon project.
- There are a lot of things missing.
- This contract has not been audited.
- I have only tested this on MacOSX.

[Watch my EthWaterloo Presentation](https://youtu.be/suS8nprnVk0?t=3419)

[Read me DevPost Project](https://devpost.com/software/eth-p2p-voip-e-th-phonehome)

[Listen to me on 'Into the Ether' 00:25:58](https://podcast.ethhub.io/ethwaterloo-recap-part-2)

## Dependencies
- `brew install sox` http://sox.sourceforge.net/sox.html
- https://github.com/T-vK/tvoip

## How to run
1. `npm install`
1. `yarn call --network kovan`

## Callable Methods on Registry Contract
```
 +  Registry
    - [Pub] getPrice
    - [Ext] setPrice #
    - [Pub] canCall
    - [Ext] addToCallList #
    - [Ext] removeFromCallList #
    - [Ext] call #
    - [Ext] answer #
    - [Ext] withdraw #
```
