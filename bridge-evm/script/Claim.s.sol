// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import {BridgeTypes} from "../contracts/interface/BridgeTypes.sol";
import {ReceiptUtils} from "../contracts/utils/ReceiptUtils.sol";
import "./DeployerBase.s.sol";

contract ClaimTokens is DeployerBase {

    using ReceiptUtils for BridgeTypes.FullReceipt;
    /// There is a problem with the FullReceipt struct, because parsing needs alphabetical order

    struct FullReceiptJson {
        uint256 amountFrom; // amount of tokens sent
        uint256 amountTo; // amount of tokens received
        uint256 chainFrom; // chain id of the source chain
        uint256 chainTo; // chain id of the destination chain
        bytes data; // additional data of the transaction (eg. user nonce for Solana)
        uint256 eventId; // transaction number
        uint256 flags; // flags for receiver
        bytes32 from; // source address (bytes32 because of cross-chain compatibility)
        bytes32 to; // destination address (bytes32 because of cross-chain compatibility)
        bytes32 tokenAddressFrom; // source token address (bytes32 because of cross-chain compatibility)
        bytes32 tokenAddressTo; // source token address (bytes32 because of cross-chain compatibility)
    }

    function getReceipt(
        string memory path
    ) public view returns (BridgeTypes.FullReceipt memory) {
        try vm.readFile(path) returns (string memory json) {
            bytes memory data = vm.parseJson(json);
            FullReceiptJson memory receiptJson =
                abi.decode(data, (FullReceiptJson));
            BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
                from: receiptJson.from,
                to: receiptJson.to,
                tokenAddressFrom: receiptJson.tokenAddressFrom,
                tokenAddressTo: receiptJson.tokenAddressTo,
                amountFrom: receiptJson.amountFrom,
                amountTo: receiptJson.amountTo,
                chainFrom: receiptJson.chainFrom,
                chainTo: receiptJson.chainTo,
                eventId: receiptJson.eventId,
                flags: receiptJson.flags,
                data: receiptJson.data
            });
            return receipt;
        } catch (bytes memory error) {
            console.log("Error reading receipt");
            console.log(vm.toString(error));
            revert();
        } catch Error(string memory reason) {
            console.log("Error reading receipt");
            console.log(reason);
            revert();
        }
    }

    function run(string memory path, bytes memory signature) public {
        getDeployer();
        vm.startBroadcast(deployer.privateKey);
        getBridge();
        bridge.claim(getReceipt(path), signature);
        vm.stopBroadcast();
    }

}
