const { hashMessage, AbiCoder, keccak256, getBytes } = require('ethers');
function full2mini(
  from,
  to,
  tokenAddressFrom,
  tokenAddressTo,
  amountFrom,
  amountTo,
  chainFrom,
  chainTo,
  eventId,
  flags,
  data
) {
  return {
    to,
    tokenAddressTo,
    amountTo,
    chainFrom,
    chainTo,
    eventId,
    flags: BigInt(flags) >> 65n,
    data
  };
}

function fullReceipt2hash(
  from,
  to,
  tokenAddressFrom,
  tokenAddressTo,
  amountFrom,
  amountTo,
  chainFrom,
  chainTo,
  eventId,
  flags,
  data
) {
  const mini = full2mini(
    from,
    to,
    tokenAddressFrom,
    tokenAddressTo,
    amountFrom,
    amountTo,
    chainFrom,
    chainTo,
    eventId,
    flags,
    data
  );
  return miniReceipt2hash(mini.to, mini.tokenAddressTo, mini.amountTo, mini.chainFrom, mini.chainTo, mini.eventId, mini.flags, mini.data);
  // const encoded = AbiCoder.defaultAbiCoder().encode(
  //   ['bytes32', 'bytes32', 'bytes32', 'bytes32', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
  //     [from, to, tokenAddressFrom, tokenAddressTo, amountFrom, amountTo, chainFrom, chainTo, eventId, flags, data]
  //   )
  // const messageHash = keccak256(encoded);
  // return hashMessage(
  //   getBytes(messageHash)
  // );
}

function miniReceipt2hash(
  to,
  tokenAddressTo,
  amountTo,
  chainFrom,
  chainTo,
  eventId,
  flags,
  data
) {
  const encoded = AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'bytes32', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
    [to, tokenAddressTo, amountTo, chainFrom, chainTo, eventId, flags, data]
  )
  const messageHash = keccak256(encoded);
  return hashMessage(
    getBytes(messageHash)
  );
}

function help(mode) {
  fullHelp = "node receipt2Hash.js--full <from> <to> <tokenAddressFrom> <tokenAddressTo> <amountFrom> <amountTo> <chainFrom> <chainTo> <eventId> <flags> <data>"
  miniHelp = "node receipt2Hash.js--mini <to> <tokenAddressTo> <amountTo> <chainFrom> <chainTo> <eventId> <flags> <data>"
  console.log(`Usage: \n${mode === "full" ? fullHelp : miniHelp}`);
  process.exit(1);

}
let receipt2hash = "";
switch (process.argv[2]) {
  case '--full':
    if (process.argv.length < 14) {
      help("full");
      process.exit(1);
    };
    receipt2hash = fullReceipt2hash(
      process.argv[3], // from
      process.argv[4], // to
      process.argv[5], // tokenAddressFrom
      process.argv[6], // tokenAddressTo
      process.argv[7], // amountFrom
      process.argv[8], // amountTo
      process.argv[9], // chainFrom
      process.argv[10], // chainTo
      process.argv[11], // eventId
      process.argv[12], // flags
      process.argv[13] // data
    );
    break;
  case '--mini':
    if (process.argv.length < 11) {
      help("mini");
      process.exit(1);
    }
    receipt2hash = miniReceipt2hash(
      process.argv[3], // to
      process.argv[4], // tokenAddressTo
      process.argv[5], // amountTo
      process.argv[6], // chainFrom
      process.argv[7], // chainTo
      process.argv[8], // eventId
      process.argv[9], // flags
      process.argv[10] // data
    );
    break;
  default:
    help("full");
    help("mini");
    process.exit(1);
}
process.stdout.write(receipt2hash);