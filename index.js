const Web3 = require("web3");
const promptly = require("promptly");
const infuraNode = "https://mainnet.infura.io/";
const web3 = new Web3(new Web3.providers.HttpProvider(infuraNode));

// Helper functions

function getLatestBlockData() {
  let blockData = web3.eth.getBlock("latest");
  return blockData;
}

function getBlockData(blockNumber) {
  let blockData = web3.eth.getBlock(blockNumber);
  return blockData;
}

async function getBlockTxHashes(blockNumber) {
  let blockData = await getBlockData(blockNumber);
  return blockData.transactions;
}

async function getBlockDataRange(startBlockNumber, endBlockNumber) {
  var BlockRange = [];

  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    let blockData = await getBlockData(i);
    BlockRange.push(blockData);
  }
  return BlockRange;
}

async function getBlockDataRangeFromLatest(blocksFromLatest) {
  var BlockRange = [];
  let latestBlock = await getLatestBlockData();

  for (var i = blocksFromLatest; i >= 0; i--) {
    let blockData = await getBlockData(latestBlock.number - i);
    BlockRange.push(blockData);
  }
  return BlockRange;
}

async function getTxData(txHash) {
  let txData = await web3.eth.getTransaction(txHash);
  //console.log(txData);
  return txData;
}

function parseNullTxValue(txData) {
  if (txData !== null) {
    return txData.value;
  } else {
    return "0";
  }
}

function parseToNumberValue(parsedValue) {
  let stringEtherValue = web3.utils.fromWei(parsedValue);
  let numberValue = Number(stringEtherValue);
  return numberValue;
}

function parseTxValue(txData) {
  let parsedTxValue = parseNullTxValue(txData);
  let numberValue = parseToNumberValue(parsedTxValue);
  return numberValue;
}

function parseTxRecipient(txData) {
  let recipient = txData.to;
  return recipient;
}

function parseTxSender(txData) {
  let sender = txData.from;
  return sender;
}

function parseRecipients(blockTxData) {
  let recipients = {};

  for (const txData of blockTxData) {
    let txRecipient = parseTxRecipient(txData);
    let numberValue = parseTxValue(txData);
    if (txRecipient in recipients) {
      recipients[txRecipient] += numberValue;
    } else {
      recipients[txRecipient] = numberValue;
    }
  }
  //console.log(recipients);
  return recipients;
}

function parseSenders(blockTxData) {
  let senders = {};

  for (const txData of blockTxData) {
    let txSender = parseTxSender(txData);
    let numberValue = parseTxValue(txData);
    if (txSender in senders) {
      senders[txSender] += numberValue;
    } else {
      senders[txSender] = numberValue;
    }
  }
  //console.log(senders);
  return senders;
}

function getBlockValue(blockTxData) {
  let blockValue = 0;

  for (const txData of blockTxData) {
    let numberValue = parseTxValue(txData);
    blockValue += numberValue;
  }
  //console.log(blockValue);
  return blockValue;
}

async function parseContracts(blockTxData) {
  let contractAddresses = {};

  for (const txData of blockTxData) {
    let codeFrom = await web3.eth.getCode(txData.from);
    let codeTo = await web3.eth.getCode(txData.to);
    if (codeFrom !== "0x") {
      var addressFrom = {};
      addressFrom[txData.from] = true;
      Object.assign(contractAddresses, addressFrom);
    }
    if (codeTo !== "0x") {
      var addressTo = {};
      addressTo[txData.to] = true;
      Object.assign(contractAddresses, addressTo);
    }
  }
  //console.log(contractAddresses);
  return contractAddresses;
}

async function getBlockTxData(blockNumber) {
  let blockTxHashes = await getBlockTxHashes(blockNumber);
  let blockTxData = [];

  for (const tx of blockTxHashes) {
    let txData = await getTxData(tx);
    blockTxData.push(txData);
  }
  //console.log(blockTxData);
  return blockTxData;
}

function parseBlockTxValues(blockTxData) {
  let parsedBlock = [];

  for (const txData of blockTxData) {
    let numberValue = parseTxValue(txData);
    if (numberValue > 0) {
      parsedBlock.push(txData);
    }
  }
  //console.log(parsedBlock);
  return parsedBlock;
}

function compareRecipients(recipients, blockRecipients) {
  for (var key in blockRecipients) {
    if (recipients.hasOwnProperty(key)) {
      recipients[key] += blockRecipients[key];
    } else {
      var recipient = {};
      recipient[key] = blockRecipients[key];
      Object.assign(recipients, recipient);
    }
  }
  return recipients;
}

function compareSenders(senders, blockSenders) {
  for (var key in blockSenders) {
    if (senders.hasOwnProperty(key)) {
      senders[key] += blockSenders[key];
    } else {
      var sender = {};
      sender[key] = blockSenders[key];
      Object.assign(senders, sender);
    }
  }
  return senders;
}

function compareContracts(contracts, contractAddresses) {
  for (var key in contractAddresses) {
    if (contracts.hasOwnProperty(key)) {
      contracts[key] += contractAddresses[key];
    } else {
      var contract = {};
      contract[key] = contractAddresses[key];
      Object.assign(contracts, contract);
    }
  }
  return contracts;
}

async function parseBlocks(BlockRange) {
  var recipients = {};
  var senders = {};
  var contracts = {};
  var totalValue = 0;

  for (const block of BlockRange) {
    let blockTxData = await getBlockTxData(block.number);
    let parsedBlock = await parseBlockTxValues(blockTxData);
    let blockValue = await getBlockValue(parsedBlock);
    let blockRecipients = await parseRecipients(parsedBlock);
    let blockSenders = await parseSenders(parsedBlock);
    let contractAddresses = await parseContracts(parsedBlock);

    // Comparing recipients
    recipients = await compareRecipients(recipients, blockRecipients);

    // Comparing senders
    senders = await compareSenders(senders, blockSenders);

    // Comparing contract addresses
    contracts = await compareContracts(contracts, contractAddresses);

    totalValue += blockValue;
  }
  return { totalValue, recipients, senders, contracts };
}

async function getBlockRangeEtherCashFlow(startBlockNumber, endBlockNumber) {
  let BlockRange = await getBlockDataRange(startBlockNumber, endBlockNumber);

  let { totalValue, recipients, senders, contracts } = await parseBlocks(
    BlockRange
  );

  console.log(totalValue, recipients, senders, contracts);

  return totalValue, recipients, senders, contracts;
}

async function getBlockRangeFromLatestEtherCashFlow(blocksFromLatest) {
  let BlockRange = await getBlockDataRangeFromLatest(blocksFromLatest);

  let { totalValue, recipients, senders, contracts } = await parseBlocks(
    BlockRange
  );

  console.log(totalValue, recipients, senders, contracts);

  return totalValue, recipients, senders, contracts;
}

async function initialPrompt() {
  const response = await promptly.prompt(
    "To query a specific range of blocks enter 1.\nTo query a specific number of blocks from the current block enter 2.\n(All other responses will exit the program):"
  );
  return response;
}

async function rangePrompt() {
  var start;
  var end;
  do {
    start = await promptly.prompt("Enter the starting block number to query:");
  } while (isNaN(start));
  do {
    end = await promptly.prompt("Enter the ending block number to query:");
  } while (isNaN(end));

  return await getBlockRangeEtherCashFlow(start, end);
}

async function fromLatestPrompt() {
  var fromLatest;
  do {
    fromLatest = await promptly.prompt(
      "Enter the number of blocks to query from the latest block:"
    );
  } while (isNaN(fromLatest));

  return await getBlockRangeFromLatestEtherCashFlow(fromLatest);
}

const main = async () => {
  console.log("\nThank you for using the EtherCashFlow Block Explorer!\n");

  let response = await initialPrompt();

  //console.log(response);

  if (response === "1") {
    await rangePrompt();
    await main();
    //console.log(startingBlock, endingBlock);
    //await getBlockRangeEtherCashFlow(startingBlock, endingBlock);
  }
  if (response === "2") {
    await fromLatestPrompt();
    await main();
  }
};

main();

//getLatestBlockData();
//getBlockData(0);
//getBlockTxHashes(5000001);
//getBlockDataRange(0, 5);
//getBlockDataRangeFromLatest(5);
//getTxData("0xed0c9a5e4b75cc10e9e0e8106ab5c3c16381582e20b8ee644b99d98fb68fb36f");
//getBlockTxData(5000001);
//getBlockRangeEtherCashFlow(5000000, 5000001);
//getBlockRangeFromLatestEtherCashFlow(1);
