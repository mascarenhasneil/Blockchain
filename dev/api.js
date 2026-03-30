const Blockchain = require('./blockchain');
const port = process.argv[2];
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const {
	globalLimiter,
	writeLimiter,
	miningLimiter,
	getHelmetMiddleware,
	requireApiKey,
	validateRequest,
	transactionRules,
	nodeUrlRules,
	bulkNodeRules,
	mineBroadcastRules,
	blockHashParamRules,
	txParamRules,
	addressParamRules
} = require('./security');

const nodeAddress = uuidv4().split('-').join('');
const bitcoin = new Blockchain();

app.disable('x-powered-by');
app.use(getHelmetMiddleware());
app.use(globalLimiter);
app.use(requireApiKey);
// express 4.16+ ships built-in JSON / urlencoded middleware — no body-parser needed
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));



// get entire blockchain
app.get('/blockchain', function(req, res) {
    res.send(bitcoin);
});



// create a new transaction
app.post('/transaction', writeLimiter, transactionRules, validateRequest, function(req, res) {
	const newTransaction = req.body;
	const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});


// mine a block
app.get('/mine', miningLimiter, function(req, res) {
	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock['index'] + 1
	};
	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
	const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		requestPromises.push(
			axios.post(networkNodeUrl + '/mine-broadcast', { newBlock })
		);
	});

	Promise.all(requestPromises)
	.then(() => {
		return axios.post(bitcoin.currentNodeUrl + '/transaction/broadcast', {
			amount: 12.5,
			sender: '00',
			recipient: nodeAddress
		});
	})
	.then(() => {
		res.json({
			note: 'New block mined & broadcast successfully',
			block: newBlock
		});
	})
	.catch(err => {
		res.status(500).json({ note: 'Mining failed.', error: err.message });
	});
});



// register a node and broadcast it the network
app.post('/register-and-broadcast-node', writeLimiter, nodeUrlRules, validateRequest, function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1) bitcoin.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		regNodesPromises.push(
			axios.post(networkNodeUrl + '/register-node', { newNodeUrl })
		);
	});

	Promise.all(regNodesPromises)
	.then(() => {
		return axios.post(newNodeUrl + '/register-nodes-bulk', {
			allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ]
		});
	})
	.then(() => {
		res.json({ note: 'New node registered with network successfully.' });
	})
	.catch(err => {
		res.status(500).json({ note: 'Node registration failed.', error: err.message });
	});
});


// register a node with the network
app.post('/register-node', writeLimiter, nodeUrlRules, validateRequest, function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if ((bitcoin.networkNodes.indexOf(newNodeUrl) === -1) && (bitcoin.currentNodeUrl !== newNodeUrl)) {
		bitcoin.networkNodes.push(newNodeUrl);
	}
	res.json({ note: 'New node registered successfully.' });
});


// register multiple nodes at once
app.post('/register-nodes-bulk', writeLimiter, bulkNodeRules, validateRequest, function(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		if ((bitcoin.networkNodes.indexOf(networkNodeUrl) === -1) && (bitcoin.currentNodeUrl !== networkNodeUrl)) {
			bitcoin.networkNodes.push(networkNodeUrl);
		}
	});
	res.json({ note: 'Bulk registration successful.' });
});


// broadcast a new transaction to all network nodes
app.post('/transaction/broadcast', writeLimiter, transactionRules, validateRequest, function(req, res) {
	const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
	bitcoin.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		requestPromises.push(
			axios.post(networkNodeUrl + '/transaction', newTransaction)
		);
	});

	Promise.all(requestPromises)
	.then(() => {
		res.json({ note: 'Transaction created and broadcast successfully.' });
	})
	.catch(err => {
		res.status(500).json({ note: 'Transaction broadcast failed.', error: err.message });
	});
});


// receive new broadcasted mined block
app.post('/mine-broadcast', writeLimiter, mineBroadcastRules, validateRequest, function(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = bitcoin.getLastBlock();

	if ((lastBlock.hash === newBlock.previousBlockHash) && (lastBlock['index'] + 1 === newBlock['index'])) {
		bitcoin.chain.push(newBlock);
		bitcoin.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});


// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		requestPromises.push(axios.get(networkNodeUrl + '/blockchain'));
	});

	Promise.all(requestPromises)
	.then(responses => {
		// axios wraps each response; extract the actual blockchain data
		const blockchains = responses.map(r => r.data);

		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			}
		});

		if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		} else {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
	})
	.catch(err => {
		res.status(500).json({ note: 'Consensus check failed.', error: err.message });
	});
});


// get block by blockHash
app.get('/block/:blockHash', blockHashParamRules, validateRequest, function(req, res) {
	const blockHash = req.params.blockHash;
	const correctBlock = bitcoin.getBlock(blockHash);
	res.json({ block: correctBlock });
});


// get transaction by transactionId
app.get('/transaction/:transactionId', txParamRules, validateRequest, function(req, res) {
	const transactionId = req.params.transactionId;
	const transactionData = bitcoin.getTransaction(transactionId);
	res.json({
		transaction: transactionData.transaction,
		block: transactionData.block
	});
});


// get address by address
app.get('/address/:address', addressParamRules, validateRequest, function(req, res) {
	const address = req.params.address;
	const addressData = bitcoin.getAddressData(address);
	res.json({ addressData: addressData });
});


// block explorer
app.get('/block-explorer', function(req, res) {
	res.sendFile('./block-explorer/index.html', { root: __dirname });
});


app.use(function(req, res) {
	res.status(404).json({ note: 'Route not found.' });
});


app.use(function(err, req, res, next) {
	if (err && err.type === 'entity.too.large') {
		return res.status(413).json({ note: 'Payload too large.' });
	}

	const message = err && err.message ? err.message : 'Unexpected server error.';
	return res.status(500).json({ note: 'Server error.', error: message });
});


if (require.main === module) {
	app.listen(port, function() {
		console.log(`Listening on Port ${port}......`);
	});
}


module.exports = { app, bitcoin };


