const Blockchain = require('./blockchain');
const port = process.argv[2];

const express=require('express')
const app=express();
const bodyParser=require('body-parser');
const {v4: uuidv4} =require('uuid');

const nodeAddress= uuidv4().split('-').join('');

const bitcoin = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



// get entire blockchain
app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
  });



// create a new transaction
app.post('/transaction', function(req, res) {
	const newTransaction = req.body;
	const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.get('/mine',function(req,res){
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
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				amount: 12.5,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note: "New block mined & broadcast successfully",
			block: newBlock
		});
	});


});




app.listen(port, function(){
    console.log(`Listening on Port ${port}......`);
});


