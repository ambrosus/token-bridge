const { hashMessage, AbiCoder, keccak256, getBytes } = require('ethers');

function payload2hash(
  tokenAddress,
  amountToSend,
  feeAmount,
  timestamp,
  flags,
  flagData
) {
  const encoded = AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
    [tokenAddress, amountToSend, feeAmount, timestamp, flags, flagData]
  );
  const messageHash = keccak256(encoded);
  return hashMessage(
    getBytes(messageHash)
  );
}

if (process.argv.length < 7) {
  console.log('Usage: node payload2Hash.js <tokenAddress> <amountToSend> <feeAmount> <timestamp> <flags> <flagData>');
  process.exit(1);
}
process.stdout.write(payload2hash(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6], process.argv[7]));
