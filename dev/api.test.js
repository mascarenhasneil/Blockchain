const request = require('supertest');
const axios = require('axios');
const Blockchain = require('./blockchain');
const { app, bitcoin } = require('./api');

jest.mock('axios');

function resetBlockchainState() {
	const fresh = new Blockchain();
	bitcoin.chain = JSON.parse(JSON.stringify(fresh.chain));
	bitcoin.pendingTransactions = [];
	bitcoin.networkNodes = [];
	bitcoin.currentNodeUrl = 'http://localhost:3001';
}

describe('API hardening and routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		resetBlockchainState();
		process.env.REQUIRE_API_KEY = 'false';
		delete process.env.API_KEY;
	});

	test('GET /blockchain returns blockchain payload', async () => {
		const response = await request(app).get('/blockchain');
		expect(response.status).toBe(200);
		expect(response.body.chain).toBeDefined();
	});

	test('POST /transaction validates request body', async () => {
		const response = await request(app).post('/transaction').send({ amount: -1, sender: '', recipient: '' });
		expect(response.status).toBe(400);
		expect(response.body.note).toBe('Validation failed.');
	});

	test('POST /transaction adds transaction to pending list', async () => {
		const response = await request(app)
			.post('/transaction')
			.send({ amount: 10, sender: 'alice', recipient: 'bob', transactionId: 'manual-id' });

		expect(response.status).toBe(200);
		expect(response.body.note).toMatch(/Transaction will be added in block/);
		expect(bitcoin.pendingTransactions.length).toBe(1);
	});

	test('POST /transaction/broadcast creates and broadcasts transaction', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		axios.post.mockResolvedValue({ data: { ok: true } });

		const response = await request(app)
			.post('/transaction/broadcast')
			.send({ amount: 25, sender: 'alice', recipient: 'bob' });

		expect(response.status).toBe(200);
		expect(response.body.note).toBe('Transaction created and broadcast successfully.');
		expect(axios.post).toHaveBeenCalledTimes(1);
	});

	test('POST /transaction/broadcast returns 500 on broadcast error', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		axios.post.mockRejectedValue(new Error('network fail'));

		const response = await request(app)
			.post('/transaction/broadcast')
			.send({ amount: 25, sender: 'alice', recipient: 'bob' });

		expect(response.status).toBe(500);
		expect(response.body.note).toBe('Transaction broadcast failed.');
	});

	test('GET /mine mines and broadcasts block', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		jest.spyOn(bitcoin, 'proofOfWork').mockReturnValue(10);
		jest.spyOn(bitcoin, 'hashBlock').mockReturnValue('0000abc');
		axios.post.mockResolvedValue({ data: { ok: true } });

		const response = await request(app).get('/mine');

		expect(response.status).toBe(200);
		expect(response.body.note).toBe('New block mined & broadcast successfully');
		expect(axios.post).toHaveBeenCalledTimes(2);
	});

	test('GET /mine returns 500 when broadcast fails', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		jest.spyOn(bitcoin, 'proofOfWork').mockReturnValue(10);
		jest.spyOn(bitcoin, 'hashBlock').mockReturnValue('0000abc');
		axios.post.mockRejectedValue(new Error('mine fail'));

		const response = await request(app).get('/mine');

		expect(response.status).toBe(500);
		expect(response.body.note).toBe('Mining failed.');
	});

	test('POST /register-and-broadcast-node validates URL', async () => {
		const response = await request(app).post('/register-and-broadcast-node').send({ newNodeUrl: 'not-a-url' });
		expect(response.status).toBe(400);
	});

	test('POST /register-and-broadcast-node registers and broadcasts node', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		axios.post.mockResolvedValue({ data: { ok: true } });

		const response = await request(app)
			.post('/register-and-broadcast-node')
			.send({ newNodeUrl: 'http://localhost:3003' });

		expect(response.status).toBe(200);
		expect(response.body.note).toBe('New node registered with network successfully.');
	});

	test('POST /register-and-broadcast-node returns 500 on failure', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		axios.post.mockRejectedValue(new Error('register fail'));

		const response = await request(app)
			.post('/register-and-broadcast-node')
			.send({ newNodeUrl: 'http://localhost:3003' });

		expect(response.status).toBe(500);
		expect(response.body.note).toBe('Node registration failed.');
	});

	test('POST /register-node adds a node once', async () => {
		const response = await request(app).post('/register-node').send({ newNodeUrl: 'http://localhost:3002' });
		expect(response.status).toBe(200);
		expect(bitcoin.networkNodes).toContain('http://localhost:3002');
	});

	test('POST /register-nodes-bulk validates array payload', async () => {
		const response = await request(app).post('/register-nodes-bulk').send({ allNetworkNodes: [] });
		expect(response.status).toBe(400);
	});

	test('POST /register-nodes-bulk registers unique nodes', async () => {
		const response = await request(app).post('/register-nodes-bulk').send({ allNetworkNodes: ['http://localhost:3002'] });
		expect(response.status).toBe(200);
		expect(bitcoin.networkNodes).toContain('http://localhost:3002');
	});

	test('POST /mine-broadcast accepts valid block', async () => {
		const lastBlock = bitcoin.getLastBlock();
		const validBlock = {
			index: lastBlock.index + 1,
			timestamp: Date.now(),
			transactions: [],
			nonce: 1,
			hash: '0000abc',
			previousBlockHash: lastBlock.hash
		};

		const response = await request(app).post('/mine-broadcast').send({ newBlock: validBlock });
		expect(response.status).toBe(200);
		expect(response.body.note).toBe('New block received and accepted.');
	});

	test('POST /mine-broadcast rejects invalid block', async () => {
		const response = await request(app).post('/mine-broadcast').send({
			newBlock: {
				index: 999,
				nonce: 1,
				hash: 'x',
				previousBlockHash: 'wrong'
			}
		});
		expect(response.status).toBe(200);
		expect(response.body.note).toBe('New block rejected.');
	});

	test('GET /consensus keeps current chain when no longer valid chain exists', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		axios.get.mockResolvedValue({
			data: {
				chain: bitcoin.chain,
				pendingTransactions: []
			}
		});

		const response = await request(app).get('/consensus');
		expect(response.status).toBe(200);
		expect(response.body.note).toBe('Current chain has not been replaced.');
	});

	test('GET /consensus replaces chain when longer valid chain exists', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		const longChain = [
			...bitcoin.chain,
			{
				index: 2,
				timestamp: Date.now(),
				transactions: [],
				nonce: 123,
				hash: '0000longhash',
				previousBlockHash: bitcoin.chain[0].hash
			}
		];

		jest.spyOn(bitcoin, 'chainIsValid').mockReturnValue(true);
		axios.get.mockResolvedValue({
			data: {
				chain: longChain,
				pendingTransactions: [{ amount: 1, sender: 'a', recipient: 'b', transactionId: 'tx' }]
			}
		});

		const response = await request(app).get('/consensus');
		expect(response.status).toBe(200);
		expect(response.body.note).toBe('This chain has been replaced.');
	});

	test('GET /consensus returns 500 on remote error', async () => {
		bitcoin.networkNodes = ['http://localhost:3002'];
		axios.get.mockRejectedValue(new Error('consensus fail'));

		const response = await request(app).get('/consensus');
		expect(response.status).toBe(500);
		expect(response.body.note).toBe('Consensus check failed.');
	});

	test('GET /block/:blockHash returns block', async () => {
		const genesisHash = bitcoin.getLastBlock().hash;
		const response = await request(app).get(`/block/${genesisHash}`);
		expect(response.status).toBe(200);
		expect(response.body.block.hash).toBe(genesisHash);
	});

	test('GET /transaction/:transactionId returns null for unknown transaction', async () => {
		const response = await request(app).get('/transaction/unknown-id');
		expect(response.status).toBe(200);
		expect(response.body.transaction).toBeNull();
	});

	test('GET /address/:address returns address data', async () => {
		const response = await request(app).get('/address/alice');
		expect(response.status).toBe(200);
		expect(response.body.addressData).toBeDefined();
	});

	test('GET /block-explorer serves html page', async () => {
		const response = await request(app).get('/block-explorer');
		expect(response.status).toBe(200);
		expect(response.text).toContain('<!DOCTYPE html>');
	});

	test('returns 404 for unknown routes', async () => {
		const response = await request(app).get('/does-not-exist');
		expect(response.status).toBe(404);
		expect(response.body.note).toBe('Route not found.');
	});

	test('returns 413 for payload too large', async () => {
		const largeBody = 'x'.repeat(130000);
		const response = await request(app)
			.post('/transaction')
			.set('Content-Type', 'application/json')
			.send(`{"amount":1,"sender":"${largeBody}","recipient":"bob"}`);

		expect(response.status).toBe(413);
		expect(response.body.note).toBe('Payload too large.');
	});

	test('API key auth blocks requests when enabled', async () => {
		process.env.REQUIRE_API_KEY = 'true';
		process.env.API_KEY = 'secret';

		const blocked = await request(app).get('/blockchain');
		expect(blocked.status).toBe(401);

		const allowed = await request(app).get('/blockchain').set('x-api-key', 'secret');
		expect(allowed.status).toBe(200);
	});

	test('API key auth returns 500 when enabled but API_KEY is missing', async () => {
		process.env.REQUIRE_API_KEY = 'true';
		delete process.env.API_KEY;

		const response = await request(app).get('/blockchain');
		expect(response.status).toBe(500);
		expect(response.body.note).toBe('Server API key is not configured.');
	});
});
