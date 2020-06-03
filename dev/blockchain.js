const sha256 = require('sha256')                 // 	importing SHA256 module
// const currentNodeUrl = process.argv[3];          //	reading the current node url as agrument. this is sent when we run the node.
const {v4: uuidv4} =require('uuid');             //     importing UUID module - version 4




// The Blockchin constructor 
function Blockchain() {
	this.chain = [];
    	this.pendingTransactions = [];
    
	this.currentNodeUrl = process.argv[3];          //	reading the current node url as agrument. this is sent when we run the node.
	this.networkNodes = [];

	this.createNewBlock(0, '0', '0');  				// Genecis Block can be anyting I have kept it '0' for all values.
};

// This function is primary. It creates the block. adds other crucial details like time stamp and index.
// this block takes in the pending transaction and pushes to the corrent blockchain. 
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: this.pendingTransactions,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	};

	this.pendingTransactions = [];
	this.chain.push(newBlock);

	return newBlock;
};

// This function is very simple. get the last block in the chain.
Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
};

// This functuon is the Data you want to store. Here i am using Transaction. 
// Say you want to maintain medical records or sales records. You need to modify this finction here accordilgly.
// In this case it creates a transaction and returns back 
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
	const newTransaction = {
		amount: amount,
		sender: sender,
		recipient: recipient,
		transactionId: uuidv4().split('-').join('')

	};

	return newTransaction;
};

// This function adds the transaction to the pending list. thats it. simple.
Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock()['index'] + 1;
};

// this is the function resposbble for hashing the prevous block hash with current block data and nonce.
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};

// Very Important fearure.. create the nonce value i.e hash starting with 0000XXXXX... 
// the pre-block hash and current block data will be hashed with hasblock function. once the noice is foudnd, sent back the nonce.
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while (hash.substring(0, 4) !== '0000') {
		nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        // console.log(hash) // Unhide this if you want to see all the generated hashes 
	}

	return nonce;
};

// Check the sent block chain, if its vaild? and send bool result back.
Blockchain.prototype.chainIsValid = function(blockchain) {
	let validChain = true;

	for (var i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
		const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
		if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

	return validChain;
};

// Search the sent block hash, check if exists and sending its details back. 
Blockchain.prototype.getBlock = function(blockHash) {
	let correctBlock = null;
	this.chain.forEach(block => {
		if (block.hash === blockHash) correctBlock = block;
	});
	return correctBlock;
};

// Search the sent Transaction ID, check if  exists and sending its details back. Also block details 
Blockchain.prototype.getTransaction = function(transactionId) {
	let correctTransaction = null;
	let correctBlock = null;

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.transactionId === transactionId) {
				correctTransaction = transaction;
				correctBlock = block;
			};
		});
	});

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
};

// Search the sent adddress ID, check if exists and sending its details back. check for both sender and receipent 
Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.sender === address || transaction.recipient === address) {
				addressTransactions.push(transaction);
			};
		});
	});

	let balance = 0;
	addressTransactions.forEach(transaction => {
		if (transaction.recipient === address) balance += transaction.amount;
		else if (transaction.sender === address) balance -= transaction.amount;
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};






module.exports = Blockchain;      //--- Exporting this module so that we can use it in app.js 














