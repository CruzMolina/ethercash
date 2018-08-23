const Web3 = require("web3");
const promptly = require("promptly");
const infuraNode = "https://mainnet.infura.io/";
const web3 = new Web3(new Web3.providers.HttpProvider(infuraNode));

// Block helper functions

const getLatestBlockData = () => {
  var blockData = web3.eth.getBlock("latest");
  return blockData;
};

const getBlockData = blockNumber => {
  var blockData = web3.eth.getBlock(blockNumber);
  return blockData;
};

const getBlockTxHashes = async blockNumber => {
  var blockData = await getBlockData(blockNumber);
  return blockData.transactions;
};

const getBlockDataRange = async (startBlockNumber, endBlockNumber) => {
  var BlockRange = [];

  for (let i = startBlockNumber; i <= endBlockNumber; i++) {
    var blockData = await getBlockData(i);
    BlockRange.push(blockData);
  }
  return BlockRange;
};

const getBlockDataRangeFromLatest = async blocksFromLatest => {
  var BlockRange = [];
  var latestBlock = await getLatestBlockData();

  for (let i = blocksFromLatest; i >= 0; i--) {
    var blockData = await getBlockData(latestBlock.number - i);
    BlockRange.push(blockData);
  }
  return BlockRange;
};

// Tx helper function

const getTxData = async txHash => {
  var txData = await web3.eth.getTransaction(txHash);
  return txData;
};

const getBlockTxData = async blockNumber => {
  var blockTxHashes = await getBlockTxHashes(blockNumber);
  var blockTxData = [];

  for (const tx of blockTxHashes) {
    var txData = await getTxData(tx);
    blockTxData.push(txData);
  }
  return blockTxData;
};

// Tx data parsers

const parseNullTxValue = txData => {
  if (txData !== null) {
    return txData.value;
  } else {
    return "0";
  }
};

const parseToNumberValue = parsedValue => {
  var stringEtherValue = web3.utils.fromWei(parsedValue);
  var numberValue = Number(stringEtherValue);
  return numberValue;
};

const parseTxValue = txData => {
  var parsedTxValue = parseNullTxValue(txData);
  var numberValue = parseToNumberValue(parsedTxValue);
  return numberValue;
};

const parseTxRecipient = txData => {
  var recipient = txData.to;
  return recipient;
};

const parseTxSender = txData => {
  var sender = txData.from;
  return sender;
};

const parseRecipients = blockTxData => {
  var recipients = {};

  for (const txData of blockTxData) {
    var txRecipient = parseTxRecipient(txData);
    var numberValue = parseTxValue(txData);
    if (txRecipient in recipients) {
      recipients[txRecipient] += numberValue;
    } else {
      recipients[txRecipient] = numberValue;
    }
  }
  return recipients;
};

const parseSenders = blockTxData => {
  var senders = {};

  for (const txData of blockTxData) {
    var txSender = parseTxSender(txData);
    var numberValue = parseTxValue(txData);
    if (txSender in senders) {
      senders[txSender] += numberValue;
    } else {
      senders[txSender] = numberValue;
    }
  }
  return senders;
};

// Block parser functions

const getBlockValue = blockTxData => {
  var blockValue = 0;

  for (const txData of blockTxData) {
    var numberValue = parseTxValue(txData);
    blockValue += numberValue;
  }
  return blockValue;
};

const parseContracts = async blockTxData => {
  var contractAddresses = {};

  for (const txData of blockTxData) {
    var codeFrom = await web3.eth.getCode(txData.from);
    var codeTo = await web3.eth.getCode(txData.to);
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
  return contractAddresses;
};

const parseBlockTxValues = blockTxData => {
  var parsedBlock = [];

  for (const txData of blockTxData) {
    var numberValue = parseTxValue(txData);
    if (numberValue > 0) {
      parsedBlock.push(txData);
    }
  }
  return parsedBlock;
};

const parseBlocks = async BlockRange => {
  var recipients = {};
  var senders = {};
  var contracts = {};
  var totalValue = 0;

  for (const block of BlockRange) {
    var blockTxData = await getBlockTxData(block.number);
    var parsedBlock = await parseBlockTxValues(blockTxData);
    var blockValue = await getBlockValue(parsedBlock);
    var blockRecipients = await parseRecipients(parsedBlock);
    var blockSenders = await parseSenders(parsedBlock);
    var contractAddresses = await parseContracts(parsedBlock);

    // Comparing recipients
    recipients = await compareRecipients(recipients, blockRecipients);

    // Comparing senders
    senders = await compareSenders(senders, blockSenders);

    // Comparing contract addresses
    contracts = await compareContracts(contracts, contractAddresses);

    totalValue += blockValue;
  }
  return { totalValue, recipients, senders, contracts };
};

// Compare helper functions

const compareRecipients = (recipients, blockRecipients) => {
  for (const key in blockRecipients) {
    if (recipients.hasOwnProperty(key)) {
      recipients[key] += blockRecipients[key];
    } else {
      var recipient = {};
      recipient[key] = blockRecipients[key];
      Object.assign(recipients, recipient);
    }
  }
  return recipients;
};

const compareSenders = (senders, blockSenders) => {
  for (const key in blockSenders) {
    if (senders.hasOwnProperty(key)) {
      senders[key] += blockSenders[key];
    } else {
      var sender = {};
      sender[key] = blockSenders[key];
      Object.assign(senders, sender);
    }
  }
  return senders;
};

const compareContracts = (contracts, contractAddresses) => {
  for (const key in contractAddresses) {
    if (contracts.hasOwnProperty(key)) {
      contracts[key] += contractAddresses[key];
    } else {
      var contract = {};
      contract[key] = contractAddresses[key];
      Object.assign(contracts, contract);
    }
  }
  return contracts;
};

// Format helper functions

const formatValue = value => {
  return "\nThe total Ether transferred was " + value + "!";
};

const formatRecipients = recipients => {
  console.log("Recipients of Ether:\n");
  for (const key in recipients) {
    console.log("Address " + key + " received " + recipients[key] + " Ether.");
  }
};

const formatSenders = senders => {
  console.log("");
  console.log("Senders of Ether:\n");
  for (const key in senders) {
    console.log("Address " + key + " sent " + senders[key] + " Ether.");
  }
};

const formatContracts = contracts => {
  console.log("");
  console.log("Smart Contracts:\n");
  for (const key in contracts) {
    console.log("Address " + key + " is a smart contract address.");
  }
};

// Core EtherCashFlow functions

const getBlockRangeEtherCashFlow = async (startBlockNumber, endBlockNumber) => {
  var BlockRange = await getBlockDataRange(startBlockNumber, endBlockNumber);

  let { totalValue, recipients, senders, contracts } = await parseBlocks(
    BlockRange
  );

  await formatRecipients(recipients);
  await formatSenders(senders);
  await formatContracts(contracts);

  totalValue = await formatValue(totalValue);

  console.log(totalValue);

  return;
};

const getBlockRangeFromLatestEtherCashFlow = async blocksFromLatest => {
  var BlockRange = await getBlockDataRangeFromLatest(blocksFromLatest);

  let { totalValue, recipients, senders, contracts } = await parseBlocks(
    BlockRange
  );

  await formatRecipients(recipients);
  await formatSenders(senders);
  await formatContracts(contracts);

  totalValue = await formatValue(totalValue);

  console.log(totalValue);

  return;
};

// Prompt helper functions

const initialPrompt = async () => {
  let response = await promptly.prompt(
    "To query a specific range of blocks enter 1.\nTo query a specific number of blocks from the current block enter 2.\n(All other responses will exit the program):"
  );
  return response;
};

const rangePrompt = async () => {
  var start;
  var end;
  do {
    start = await promptly.prompt("Enter the starting block number to query:");
  } while (isNaN(start));
  do {
    end = await promptly.prompt("Enter the ending block number to query:");
  } while (isNaN(end));

  console.log("\nQuerying blocks...\n");

  return await getBlockRangeEtherCashFlow(start, end);
};

const fromLatestPrompt = async () => {
  var fromLatest;
  do {
    fromLatest = await promptly.prompt(
      "Enter the number of blocks to query from the latest block:"
    );
  } while (isNaN(fromLatest));

  console.log("\nQuerying blocks...\n");

  return await getBlockRangeFromLatestEtherCashFlow(fromLatest);
};

// Main function

const main = async () => {
  console.log("\nThank you for using the EtherCashFlow Block Explorer!\n");

  let response = await initialPrompt();

  if (response === "1") {
    await rangePrompt();
    await main();
  }
  if (response === "2") {
    await fromLatestPrompt();
    await main();
  }
};

main();
