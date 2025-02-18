# Bridge Project EVM Contracts

This project contains the Ethereum Virtual Machine (EVM) contracts for the Bridge Project. The contracts facilitate token bridging between different blockchain networks.

## Project Structure

- `contracts/`: Contains the Solidity smart contracts.
  - `interface/`: Interfaces for the contracts.
  - `token/`: Token-related contracts.
  - `upgradeable/`: Upgradeable contracts.
  - `utils/`: Utility contracts.
- `docs/`: Documentation for the contracts.
- `lib/`: External libraries and dependencies.
- `scripts/`: Scripts for deployment and management.
- `test/`: Unit tests for the contracts.

## Stack

Project utilizes the following stack:
 - [Foundry](https://book.getfoundry.sh/)
 - [Solidity](https://soliditylang.org/)

 ## Getting Started

 Install dependencies with NPM:

 ```shell
 npm install
 ```

### Compiling

#### Forge

```shell
npm run build:forge
```

### Testing
#### Foundry tests

```shell
npm run test:sol
```

or 

```shell
forge test
```

#### Run all tests with NPM:

```shell
# All tests
npm test
```