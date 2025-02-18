// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import {BridgeTypes} from "../contracts/interface/BridgeTypes.sol";
import {AddressUtils} from "../contracts/utils/AddressUtils.sol";
import {PayloadUtils} from "../contracts/utils/PayloadUtils.sol";
import "./DeployerBase.s.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SendTokens is DeployerBase {

    using PayloadUtils for BridgeTypes.SendPayload;
    using AddressUtils for bytes32;
    /// There is a additional struct because parser expects alphabetical order

    struct SendPayloadJson {
        uint256 amountToSend; // amount of the tokens to be sent
        uint256 destChainId; // chain id of the destination chain
        bytes32 externalTokenAddress; // address of the external token contract (in destination chain)
        uint256 feeAmount; // amount of the fee
        bytes flagData; // additional data of the sending operation (unused for now)
        uint256 flags; // flags of the sending operation
        uint256 timestamp; // timestamp of the fee was generated
        bytes32 tokenAddress; // address of the token contract
    }

    function getPayload(
        string memory path
    ) public view returns (BridgeTypes.SendPayload memory) {
        try vm.readFile(path) returns (string memory json) {
            bytes memory data = vm.parseJson(json);
            SendPayloadJson memory payloadJson =
                abi.decode(data, (SendPayloadJson));
            BridgeTypes.SendPayload memory payload = BridgeTypes.SendPayload({
                amountToSend: payloadJson.amountToSend,
                destChainId: payloadJson.destChainId,
                externalTokenAddress: payloadJson.externalTokenAddress,
                feeAmount: payloadJson.feeAmount,
                flags: payloadJson.flags,
                flagData: payloadJson.flagData,
                timestamp: payloadJson.timestamp,
                tokenAddress: payloadJson.tokenAddress
            });
            return payload;
        } catch (bytes memory) {
            console.log("Error reading payload");
            revert();
        }
    }

    function run(string memory path, bytes memory signature) public {
        getDeployer();
        vm.startBroadcast(deployer.privateKey);
        getBridge();
        BridgeTypes.SendPayload memory payload = getPayload(path);
        ERC20 token = ERC20(payload.tokenAddress.toAddress());
        token.approve(address(bridge), payload.amountToSend);
        bridge.send{value: payload.feeAmount}(
            bytes32(
                0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCCCC
            ),
            payload,
            signature
        );
        vm.stopBroadcast();
    }

}
