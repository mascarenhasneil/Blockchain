const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');

const API_KEY_HEADER = 'x-api-key';

const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
	message: { note: 'Too many requests. Please try again later.' }
});

const writeLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 120,
	standardHeaders: true,
	legacyHeaders: false,
	message: { note: 'Too many write requests. Please try again later.' }
});

const miningLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { note: 'Mining endpoint is rate limited. Please try again later.' }
});

function getHelmetMiddleware() {
	return helmet({
		contentSecurityPolicy: false,
		crossOriginEmbedderPolicy: false
	});
}

function requireApiKey(req, res, next) {
	if (process.env.REQUIRE_API_KEY !== 'true') return next();
	if (req.path === '/block-explorer') return next();

	const configuredApiKey = process.env.API_KEY;
	if (!configuredApiKey) {
		return res.status(500).json({ note: 'Server API key is not configured.' });
	}

	const providedApiKey = req.header(API_KEY_HEADER);
	if (providedApiKey !== configuredApiKey) {
		return res.status(401).json({ note: 'Unauthorized request.' });
	}

	return next();
}

function validateRequest(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			note: 'Validation failed.',
			errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
		});
	}

	return next();
}

const transactionRules = [
	body('amount').isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
	body('sender').isString().trim().notEmpty().withMessage('sender is required'),
	body('recipient').isString().trim().notEmpty().withMessage('recipient is required')
];

const nodeUrlRules = [
	body('newNodeUrl').isURL({ require_protocol: true, require_tld: false }).withMessage('newNodeUrl must be a valid URL')
];

const bulkNodeRules = [
	body('allNetworkNodes').isArray({ min: 1 }).withMessage('allNetworkNodes must be a non-empty array'),
	body('allNetworkNodes.*').isURL({ require_protocol: true, require_tld: false }).withMessage('each network node must be a valid URL')
];

const mineBroadcastRules = [
	body('newBlock').isObject().withMessage('newBlock payload is required'),
	body('newBlock.index').isInt({ min: 1 }).withMessage('newBlock.index must be a positive integer'),
	body('newBlock.nonce').isInt({ min: 0 }).withMessage('newBlock.nonce must be a non-negative integer'),
	body('newBlock.hash').isString().trim().notEmpty().withMessage('newBlock.hash is required'),
	body('newBlock.previousBlockHash').isString().trim().notEmpty().withMessage('newBlock.previousBlockHash is required')
];

const blockHashParamRules = [
	param('blockHash').isString().trim().notEmpty().withMessage('blockHash is required')
];

const txParamRules = [
	param('transactionId').isString().trim().notEmpty().withMessage('transactionId is required')
];

const addressParamRules = [
	param('address').isString().trim().notEmpty().withMessage('address is required')
];

module.exports = {
	API_KEY_HEADER,
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
};
