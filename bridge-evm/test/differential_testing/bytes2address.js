function bytes2AddressLE(bytes) {
  if (bytes.startsWith('0x')) {
    bytes = bytes.slice(2);
  }
  return `0x${bytes.slice(0, 40).toString('hex')}`;
}
function bytes2AddressBE(bytes) {
  if (bytes.startsWith('0x')) {
    bytes = bytes.slice(2);
  }
  return ;
}

function bytes2Address(bytes, isLE = false) {
  if (bytes.startsWith('0x')) {
    bytes = bytes.slice(2);
  }
  return `0x${bytes.slice(isLE ? 0 : -40, isLE ? 40 : undefined).toString('hex')}`;
}

process.stdout.write(bytes2Address(process.argv[2], process.argv.length > 3 && process.argv[3] === 'true'));
