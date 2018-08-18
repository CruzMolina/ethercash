const Web3 = require("web3");
const infuraNode = "https://mainnet.infura.io/";
const web3 = new Web3(new Web3.providers.HttpProvider(infuraNode));

function getLatestBlock() {
  web3.eth.getBlock("latest").then(function(blockData) {
    console.log(blockData);
    return blockData;
  });
}

function getBlock(blockNumber) {
  web3.eth.getBlock(blockNumber).then(function(blockData) {
    console.log(blockData);
    return blockData;
  });
}

getLatestBlock();
getBlock(0);
