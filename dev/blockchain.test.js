/**
 * blockchain.test.js
 *
 * Jest test suite for the Blockchain core class.
 * Run with:  npm test
 */

const Blockchain = require('./blockchain');

// ------------------------------------------------------------------
// Helper: mine a real block and append it to the chain
// ------------------------------------------------------------------
function mineAndAdd(bitcoin) {
	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock.hash;
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock.index + 1,
	};
	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
	return bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
}

// ------------------------------------------------------------------
describe('Blockchain – createNewBlock', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('creates a block with the correct structural properties', () => {
		const block = bitcoin.createNewBlock(1234, 'prevHash', 'newHash');
		expect(block).toMatchObject({
			nonce: 1234,
			previousBlockHash: 'prevHash',
			hash: 'newHash',
		});
		expect(typeof block.index).toBe('number');
		expect(typeof block.timestamp).toBe('number');
		expect(Array.isArray(block.transactions)).toBe(true);
	});

	test('increments the chain length', () => {
		const before = bitcoin.chain.length;
		bitcoin.createNewBlock(1, 'prev', 'hash');
		expect(bitcoin.chain.length).toBe(before + 1);
	});

	test('moves pending transactions into the new block and clears them', () => {
		const tx = bitcoin.createNewTransaction(50, 'alice', 'bob');
		bitcoin.addTransactionToPendingTransactions(tx);

		const block = bitcoin.createNewBlock(1, 'prev', 'hash');

		expect(block.transactions).toContainEqual(tx);
		expect(bitcoin.pendingTransactions.length).toBe(0);
	});
});

// ------------------------------------------------------------------
describe('Blockchain – getLastBlock', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('returns the genesis block initially', () => {
		expect(bitcoin.getLastBlock().index).toBe(1);
	});

	test('returns the most recently added block', () => {
		bitcoin.createNewBlock(1, 'p', 'h');
		bitcoin.createNewBlock(2, 'h', 'hh');
		expect(bitcoin.getLastBlock().index).toBe(3);
	});
});

// ------------------------------------------------------------------
describe('Blockchain – createNewTransaction', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('returns a transaction with amount, sender, recipient and a transactionId', () => {
		const tx = bitcoin.createNewTransaction(100, 'SENDER_ADDR', 'RECIPIENT_ADDR');
		expect(tx).toMatchObject({
			amount: 100,
			sender: 'SENDER_ADDR',
			recipient: 'RECIPIENT_ADDR',
		});
		expect(typeof tx.transactionId).toBe('string');
		expect(tx.transactionId.length).toBeGreaterThan(0);
	});

	test('generates unique IDs for every call', () => {
		const ids = new Set(
			Array.from({ length: 20 }, () =>
				bitcoin.createNewTransaction(1, 'a', 'b').transactionId
			)
		);
		expect(ids.size).toBe(20);
	});

	test('transactionId contains no hyphens', () => {
		const tx = bitcoin.createNewTransaction(10, 'x', 'y');
		expect(tx.transactionId).not.toContain('-');
	});
});

// ------------------------------------------------------------------
describe('Blockchain – addTransactionToPendingTransactions', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('appends to pendingTransactions', () => {
		const tx = bitcoin.createNewTransaction(25, 'A', 'B');
		bitcoin.addTransactionToPendingTransactions(tx);
		expect(bitcoin.pendingTransactions).toContain(tx);
	});

	test('returns the index of the block that will include the transaction', () => {
		const tx = bitcoin.createNewTransaction(25, 'A', 'B');
		const idx = bitcoin.addTransactionToPendingTransactions(tx);
		// Genesis is block 1; the next mined block is block 2
		expect(idx).toBe(2);
	});
});

// ------------------------------------------------------------------
describe('Blockchain – hashBlock', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('returns a 64-character hex string (SHA-256)', () => {
		const hash = bitcoin.hashBlock('prevHash', { transactions: [], index: 2 }, 42);
		expect(hash).toMatch(/^[0-9a-f]{64}$/);
	});

	test('same inputs always produce the same hash (deterministic)', () => {
		const h1 = bitcoin.hashBlock('abc', { data: 1 }, 10);
		const h2 = bitcoin.hashBlock('abc', { data: 1 }, 10);
		expect(h1).toBe(h2);
	});

	test('different nonces produce different hashes', () => {
		const h1 = bitcoin.hashBlock('abc', { data: 1 }, 1);
		const h2 = bitcoin.hashBlock('abc', { data: 1 }, 2);
		expect(h1).not.toBe(h2);
	});

	test('different prevHashes produce different hashes', () => {
		const h1 = bitcoin.hashBlock('aaa', { data: 1 }, 5);
		const h2 = bitcoin.hashBlock('bbb', { data: 1 }, 5);
		expect(h1).not.toBe(h2);
	});
});

// ------------------------------------------------------------------
describe('Blockchain – proofOfWork', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('returned nonce produces a hash starting with "0000"', () => {
		const prevHash = '0000abc';
		const blockData = { transactions: [], index: 2 };
		const nonce = bitcoin.proofOfWork(prevHash, blockData);
		const hash = bitcoin.hashBlock(prevHash, blockData, nonce);
		expect(hash.substring(0, 4)).toBe('0000');
	}, 60_000);
});

// ------------------------------------------------------------------
describe('Blockchain – chainIsValid', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('returns true for a genesis-only chain', () => {
		expect(bitcoin.chainIsValid(bitcoin.chain)).toBe(true);
	});

	test('returns true for a freshly mined valid chain', () => {
		mineAndAdd(bitcoin);
		expect(bitcoin.chainIsValid(bitcoin.chain)).toBe(true);
	}, 120_000);

	test('returns false when a block hash is tampered', () => {
		mineAndAdd(bitcoin);
		const tampered = JSON.parse(JSON.stringify(bitcoin.chain));
		tampered[1].hash = 'TAMPERED_HASH';
		expect(bitcoin.chainIsValid(tampered)).toBe(false);
	}, 120_000);

	test('returns false when transactions inside a block are tampered', () => {
		const tx = bitcoin.createNewTransaction(50, 'alice', 'bob');
		bitcoin.addTransactionToPendingTransactions(tx);
		mineAndAdd(bitcoin);

		const tampered = JSON.parse(JSON.stringify(bitcoin.chain));
		tampered[1].transactions[0].amount = 9999;
		expect(bitcoin.chainIsValid(tampered)).toBe(false);
	}, 120_000);

	test('returns false when the genesis block nonce is wrong', () => {
		const tampered = JSON.parse(JSON.stringify(bitcoin.chain));
		tampered[0].nonce = 999;
		expect(bitcoin.chainIsValid(tampered)).toBe(false);
	});

	test('returns false when the genesis previousBlockHash is wrong', () => {
		const tampered = JSON.parse(JSON.stringify(bitcoin.chain));
		tampered[0].previousBlockHash = 'not-zero';
		expect(bitcoin.chainIsValid(tampered)).toBe(false);
	});

	test('returns false when a block previousBlockHash does not match prior hash', () => {
		mineAndAdd(bitcoin);
		const tampered = JSON.parse(JSON.stringify(bitcoin.chain));
		tampered[1].previousBlockHash = 'tampered-prev-hash';
		expect(bitcoin.chainIsValid(tampered)).toBe(false);
	}, 120_000);
});

// ------------------------------------------------------------------
describe('Blockchain – getBlock', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('returns the genesis block by its hash', () => {
		const genesis = bitcoin.getLastBlock();
		expect(bitcoin.getBlock(genesis.hash)).toEqual(genesis);
	});

	test('returns null for an unknown hash', () => {
		expect(bitcoin.getBlock('no-such-hash')).toBeNull();
	});
});

// ------------------------------------------------------------------
describe('Blockchain – getTransaction', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('finds a transaction after it is mined into a block', () => {
		const tx = bitcoin.createNewTransaction(75, 'alice', 'bob');
		bitcoin.addTransactionToPendingTransactions(tx);
		mineAndAdd(bitcoin);

		const result = bitcoin.getTransaction(tx.transactionId);
		expect(result.transaction).toEqual(tx);
		expect(result.block).not.toBeNull();
	}, 120_000);

	test('returns nulls for a non-existent transactionId', () => {
		const result = bitcoin.getTransaction('not-a-real-id');
		expect(result.transaction).toBeNull();
		expect(result.block).toBeNull();
	});

	test('finds a transaction in a later block when chain has multiple blocks', () => {
		const tx1 = bitcoin.createNewTransaction(10, 'a', 'b');
		bitcoin.addTransactionToPendingTransactions(tx1);
		mineAndAdd(bitcoin);

		const tx2 = bitcoin.createNewTransaction(20, 'c', 'd');
		bitcoin.addTransactionToPendingTransactions(tx2);
		mineAndAdd(bitcoin);

		const result = bitcoin.getTransaction(tx2.transactionId);
		expect(result.transaction).toEqual(tx2);
		expect(result.block.index).toBe(3);
	}, 120_000);
});

// ------------------------------------------------------------------
describe('Blockchain – getAddressData', () => {
	let bitcoin;
	beforeEach(() => { bitcoin = new Blockchain(); });

	test('calculates the correct balance and transaction list for an address', () => {
		// Alice receives 100 + 50, then sends 30 → net balance = 120
		const tx1 = bitcoin.createNewTransaction(100, 'coinbase', 'alice');
		const tx2 = bitcoin.createNewTransaction(50, 'coinbase', 'alice');
		const tx3 = bitcoin.createNewTransaction(30, 'alice', 'bob');
		[tx1, tx2, tx3].forEach(t => bitcoin.addTransactionToPendingTransactions(t));
		mineAndAdd(bitcoin);

		const data = bitcoin.getAddressData('alice');
		expect(data.addressBalance).toBe(120);
		expect(data.addressTransactions.length).toBe(3);
	}, 120_000);

	test('returns zero balance and empty list for an address with no activity', () => {
		const data = bitcoin.getAddressData('unknown-address');
		expect(data.addressBalance).toBe(0);
		expect(data.addressTransactions.length).toBe(0);
	});

	test('returns negative balance for an address that only sends funds', () => {
		const tx = bitcoin.createNewTransaction(40, 'only-sender', 'receiver');
		bitcoin.addTransactionToPendingTransactions(tx);
		mineAndAdd(bitcoin);

		const data = bitcoin.getAddressData('only-sender');
		expect(data.addressBalance).toBe(-40);
		expect(data.addressTransactions.length).toBe(1);
	}, 120_000);

	test('ignores transactions unrelated to the requested address', () => {
		const tx1 = bitcoin.createNewTransaction(10, 'wallet-a', 'wallet-b');
		const tx2 = bitcoin.createNewTransaction(20, 'wallet-c', 'wallet-d');
		[tx1, tx2].forEach(t => bitcoin.addTransactionToPendingTransactions(t));
		mineAndAdd(bitcoin);

		const data = bitcoin.getAddressData('wallet-a');
		expect(data.addressTransactions.length).toBe(1);
		expect(data.addressTransactions[0].transactionId).toBe(tx1.transactionId);
		expect(data.addressBalance).toBe(-10);
	}, 120_000);
});
