const {Blockchain, Transaction}= require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('9ec5d36df0f191e734aeebd75ed1980649e74972024cb6431bb05eff6eb96027');
const myWalletAddress = myKey.getPublic('hex');

let hashemiBrosCoin = new Blockchain();

const tx1 =  new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
hashemiBrosCoin.addTransaction(tx1);

/*
hashemiBrosCoin.createTransaction(new Transaction('address1', 'address2', 100));
hashemiBrosCoin.createTransaction(new Transaction('address1', 'address2', 50));
*/
console.log('\nStarting the miner...');
hashemiBrosCoin.minePendingTransactions(myWalletAddress);

//hashemiBrosCoin.minePendingTransactions('hosseins-address');
console.log('\nBalance of Hossein is', hashemiBrosCoin.getBalanceOfAddress(myWalletAddress));

hashemiBrosCoin.chain[1].transactions[0].amount = 1;
console.log('Is chain valid? ', hashemiBrosCoin.isChainValid());
/*
console.log('\nStarting the miner again...');
hashemiBrosCoin.minePendingTransactions('hosseins-address');

console.log('Mining block 1...');
hashemiBrosCoin.addBlock(new Block(1, "01/02/2021", { amount: 4 }));

console.log('Mining block 2...');
hashemiBrosCoin.addBlock(new Block(2, "01/03/2021", { amount: 8 }));
*/

/*
let hashemiBrosCoin = new Blockchain();
hashemiBrosCoin.addBlock(new Block(1, "01/02/2021", { amount: 4 }));
hashemiBrosCoin.addBlock(new Block(1, "01/03/2021", { amount: 4 }));

console.log('Is blockchain valid?' + hashemiBrosCoin.isChainValid());
//console.log(JSON.stringify(hashemiBrosCoin, null, 4));

hashemiBrosCoin.chain[1].data = { amount: 100};
hashemiBrosCoin.chain[1].hash = hashemiBrosCoin.chain[1].calculateHash();

console.log('Is blockchain valid?' + hashemiBrosCoin.isChainValid());*/