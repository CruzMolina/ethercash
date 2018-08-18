const Web3 = require("web3");
const infuraNode = "https://mainnet.infura.io/";
const web3 = new Web3(new Web3.providers.HttpProvider(infuraNode));

function getLatestBlock() {
  web3.eth.getBlock("latest").then(function(blockData) {
    //console.log(blockData);
    return blockData;
  });
}

function getBlock(blockNumber) {
  web3.eth.getBlock(blockNumber).then(function(blockData) {
    //console.log(blockData);
    return blockData;
  });
}

function getLatestBlockTxs() {
  web3.eth.getBlock("latest").then(function(blockData) {
    //console.log(blockData.transactions);
    return blockData.transactions;
  });
}

function getBlockTxs(blockNumber) {
  web3.eth.getBlock(blockNumber).then(function(blockData) {
    //console.log(blockData.transactions);
    return blockData.transactions;
  });
}

function getLatestBlockTxByIndex(index) {
  web3.eth.getBlock("latest").then(function(blockData) {
    //console.log(blockData.transactions[index]);
    return blockData.transactions[index];
  });
}

function getBlockTxByIndex(blockNumber, index) {
  web3.eth.getBlock(blockNumber).then(function(blockData) {
    //console.log(blockData.transactions[index]);
    return blockData.transactions[index];
  });
}

//getLatestBlock();
//getBlock(0);
//getLatestBlockTxs();
//getBlockTxs(5000001);
//getLatestBlockTxsByIndex(0);
//getBlockTxsByIndex(5000001, 0);
