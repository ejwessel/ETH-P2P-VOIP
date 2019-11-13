## Inspiration
- I hate getting spam called.
- I wanted to put a barrier between myself and the caller and have the caller pay a price that I define.
- I wanted to create an incentive for me to pick up.
- I think it's terrible that phone numbers are a source of identity, why not use a real source of identity?
- I wanted to get rid of providers that sell your number, your data, etc.
- I wanted to get rid of sim swapping
- I wanted to see if I could make phone calls using an Ethereum address
- I wanted to put more control of calling back into the receiver's hands

## What it does
Eth P2P VOIP (E.TH.PhoneHome) allows calling an Ethereum address.

Basic Rules:

- all users have a default price on any token as (2^256-1); everybody is blocked by default.
- userA can define a price for a token they are willing to accept a call for.
- call lists define user pairs that can call for free
- if userB calls userA and userB is not on userA's call list they pay userA's token price (plus gas)
- if userB calls userA and userB is on userA's call list they can call userA for free (plus gas)
- if userB calls userA and userB does not answer. userB is able to withdraw the funds they would have otherwise paid to userA.

Example:
1. userB calls Registry.call(userA) given some token price defined by userA
1. Funds are escrowed in the Registry contract
1. userB VOIP node begins trying to connect to userA's VOIP node
1. An event will be emitted by the Registry contract of which userA is listening for given their particular address.
1. userA will allow userB's VOIP node to connect
1. userA calls Registry.answer(userB) and withdraws funds paid
1. talking can begin

## How I built it
- Solidity Smart Contract
- P2P VOIP (tvoip)

## Challenges I ran into
CoreAudio, Demoing TCAD since the contract is a proxy

## Accomplishments that I'm proud of
It works. It's a simple idea, but I smiled when I finished the POC

## What I learned
learned a ton about PBX, VOIP, SOX, CoreAudio

## What's next for Eth P2P VOIP (E.TH.PhoneHome)
- choose encrypted VOIP p2p service.
- p2p browser calling.
- create a metamask plugin to call through metamask.
- build out a front end abstraction utility that properly handles calling instead of relying on tests.
- use some better mechanism for determining when a call ends; use an oracle of some sort.
- figure out how to refund without a second trx if a receiver does not pick up.
- bonding curve of prices on calls; dynamic pricing scheme.
