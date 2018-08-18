const Web3 = require("web3");
const infuraNode = "https://mainnet.infura.io/";
const web3 = new Web3(new Web3.providers.HttpProvider(infuraNode));

function getLatestBlock() {
  let blockData = web3.eth.getBlock("latest");
  return blockData;
}

function getBlock(blockNumber) {
  let blockData = web3.eth.getBlock(blockNumber);
  return blockData;
}

async function getLatestBlockTxs() {
  let blockData = await getLatestBlock();
  return blockData.transactions;
}

async function getBlockTxs(blockNumber) {
  let blockData = await getBlock(blockNumber);
  return blockData.transactions;
}

async function getLatestBlockTxByIndex(index) {
  let blockData = await getLatestBlock();
  console.log(blockData.transactions[index]);
  return blockData.transactions[index];
}

async function getBlockTxByIndex(blockNumber, index) {
  let blockData = await getBlock(blockNumber);
  return blockData.transactions[index];
}

async function getBlocksByRange(startBlockNumber, endBlockNumber) {
  var BlockRange = [];

  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    let blockData = await getBlock(i);
    BlockRange.push(blockData);
  }
  return BlockRange;
}

async function getBlocksByRangeFromLatest(blocksFromLatest) {
  var BlockRange = [];
  let latestBlock = await getLatestBlock();

  for (var i = blocksFromLatest; i >= 0; i--) {
    let blockData = await getBlock(latestBlock.number - i);
    BlockRange.push(blockData);
  }
  return BlockRange;
}

async function getTxData(txHash) {
  let txData = await web3.eth.getTransaction(txHash);
  //console.log(txData);
  return txData;
}

function parseTxData(txData) {
  if (txData !== null) {
    return txData.value;
  } else {
    return "0";
  }
}

async function getLatestEtherTransferred() {
  let latestTxs = await getLatestBlockTxs();
  let latestTxValues = [];
  var latestTxData = [];
  let totalValue = 0;

  for (const tx of latestTxs) {
    let txData = await getTxData(tx);
    let parsedTxValue = await parseTxData(txData);
    let stringEtherValue = await web3.utils.fromWei(parsedTxValue);
    let numberValue = Number(stringEtherValue);
    totalValue += numberValue;
  }
  console.log(totalValue);
  return totalValue;
}

//getLatestBlock();
//getBlock(0);
//getLatestBlockTxs();
//getBlockTxs(5000001);
//getLatestBlockTxByIndex(0);
//getBlockTxByIndex(5000001, 0);
//getBlocksByRange(0, 5);
//getBlocksByRangeFromLatest(5);

//getTxData("0xed0c9a5e4b75cc10e9e0e8106ab5c3c16381582e20b8ee644b99d98fb68fb36f");

getLatestEtherTransferred();
