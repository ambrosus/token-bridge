const { hashMessage, AbiCoder, keccak256, getBytes } = require('ethers');

function receipt2hash(
  from,
  to,
  tokenAddress,
  amount,
  chainFrom,
  chainTo,
  eventId,
  flags,
  data
) {
  const encoded = AbiCoder.defaultAbiCoder().encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
      [from, to, tokenAddress, amount, chainFrom, chainTo, eventId, flags, data]
    )
  const messageHash = keccak256(encoded);
  return hashMessage(
    getBytes(messageHash)
  );
}

if (process.argv.length < 10) {
  console.log('Usage: node receipt2Hash.js <from> <to> <tokenAddress> <amount> <chainFrom> <chainTo> <eventId> <flags> <data>');
  process.exit(1);
}
process.stdout.write(receipt2hash(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6], process.argv[7], process.argv[8], process.argv[9], process.argv[10]));