module.exports = (channelID) => {
  return {
    to: channelID,
    message: "``` I am Bridgette, the minimilst web3 bridge." + "\n"
    + "    Commands: " + "\n"
    + "        query: use <addr> <blkNumber> or <txHash> to get info" +"\n"
    + "   ;    getBlockNumber : returns the current block number" +"\n"
    + "  [\"]   getBalance <account>: returns an account\'s balance" +"\n"
    + " /[_]\\  getTransaction <txId>: get info on a transaction" +"\n"
    + "  ] [   sendSignedTransaction <txHash>: send a signed transaction" +"\n"
    + "        gasPrice: gets the median gas price" +"\n"
    + "        getBlock <number> returns a block with info" +"\n"
    + " " +"\n"
    + "      dapps:" +"\n"
    + "       statebot: gives the latest state dump" +"\n"
    + "       getETC: get a small amount of etc if you need gas money " +"\n"
    + "       community: see the balance of the community multisig" +"\n"
    + "       donate <team> <percent> <addr>: get a contract to donate to your fav dev team" +"\n"
    + "```"

  };
};
