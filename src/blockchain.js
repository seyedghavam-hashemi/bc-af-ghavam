const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor( fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    //constructor(index, timestamp, data, previousHash = '')
    constructor( timestamp, transactions, previousHash = '') {
        //this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;        
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions)+this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined:" + this.hash );
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;

            }
        }

        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block("01/01/2021", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];

        /*
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward )
        ];*/
    }

    addTransaction(transaction) {

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

/*
    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }
*/
    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    /*
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        //newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }*/

    isChainValid(){
        for(let i=1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }            
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
/*
let hashemiBrosCoin = new Blockchain();
hashemiBrosCoin.createTransaction(new Transaction('address1', 'address2', 100));
hashemiBrosCoin.createTransaction(new Transaction('address1', 'address2', 50));

console.log('\n Starting the miner...');
hashemiBrosCoin.minePendingTransactions('hosseins-address');

console.log('\nBalance of Hossein is', hashemiBrosCoin.getBalanceOfAddress('hosseins-address'));

console.log('\nStarting the miner again...');
hashemiBrosCoin.minePendingTransactions('hosseins-address');
/*
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



