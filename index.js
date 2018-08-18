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

//getLatestBlock();
//getBlock(0);
//getLatestBlockTxs();
//getBlockTxs(5000001);
//getLatestBlockTxByIndex(0);
//getBlockTxByIndex(5000001, 0);
//getBlocksByRange(0, 5);
//getBlocksByRangeFromLatest(5);
