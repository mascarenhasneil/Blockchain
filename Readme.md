<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">

  <h3 align="center">Blockchain</h3>

  <p align="center">
    A hands-on blockchain implementation for learning Blockchain and Cryptocurrency Technology.
    <br />
    <a href="https://github.com/mascarenhasneil/Blockchain/blob/master/Readme.md"><strong>Explore the docs »</strong></a>
    &nbsp;·&nbsp;
    <a href="https://github.com/mascarenhasneil/Blockchain/blob/master/LEARNING.md"><strong>Learning Guide »</strong></a>
    <br />
    <br />
    <a href="https://github.com/mascarenhasneil/Blockchain">View Demo</a>
    ·
    <a href="https://github.com/mascarenhasneil/Blockchain/issues">Report Bug</a>
    ·
    <a href="https://github.com/mascarenhasneil/Blockchain/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
  * [Starting the Network](#starting-the-network)
  * [Connecting Nodes](#connecting-nodes)
  * [Creating Transactions](#creating-transactions)
  * [Mining a Block](#mining-a-block)
  * [Using the Block Explorer](#using-the-block-explorer)
  * [Running Tests](#running-tests)
* [API Reference](#api-reference)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [Code of Conduct](#code-of-conduct)
* [Security](#security)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)




<!-- ABOUT THE PROJECT -->
## About The Project

In this project you will see all of the following concepts and the blockchain will have all of the following features below:

### Blockchain Essentials

* A **Proof-of-Work Algorithm** to secure the network.
* **Hashing (SHA-256)** to secure the data within each block.
* Mine (create) new blocks containing transaction data.
* Create transactions and store them in blocks.
* An **Express API / server** to interact with the blockchain (runs on localhost).
* A **decentralised network** of multiple nodes.
* A **consensus algorithm** to keep all nodes in sync with the longest valid chain.
* A **broadcasting system** to propagate new blocks and transactions across nodes.
* A **Block Explorer** web UI to search the chain by block hash, transaction ID, or address.

> New to blockchain? Start with the [**Learning Guide**](LEARNING.md) for deep theory and code mapping.  
> Maintaining dependencies? Use the [**Dependabot Merge Playbook**](MERGE_DEPENDABOT_PLAYBOOK.md).


### Built With

* [Node.js](https://nodejs.org)
* [Express](https://expressjs.com)
* [Axios](https://axios-http.com)
* [Bootstrap](https://getbootstrap.com)
* [jQuery](https://jquery.com)
* [AngularJS](https://angularjs.org/)
* [Jest](https://jestjs.io) (testing)



<!-- GETTING STARTED -->
## Getting Started

Clone and run a local five-node blockchain network in minutes.


### Prerequisites

**Node.js v18 or higher** is required.

* Download and install from [nodejs.org/en/download](https://nodejs.org/en/download/current)
* Verify your versions:
```sh
node --version   # should print v18.x or higher
npm --version    # should print 9.x or higher
```


### Installation

1. Clone the repository
```sh
git clone https://github.com/mascarenhasneil/Blockchain.git
cd Blockchain
```

2. Install all dependencies
```sh
npm install
```

3. Verify there are no critical security vulnerabilities
```sh
npm audit
```



<!-- USAGE EXAMPLES -->
## Usage

### Starting the Network

This project includes five pre-configured nodes.  
Each node must run in its **own terminal window**.

Open five terminals and run one command in each:

```sh
# Terminal 1
npm run node_1

# Terminal 2
npm run node_2

# Terminal 3
npm run node_3

# Terminal 4
npm run node_4

# Terminal 5
npm run node_5
```

Each node starts listening on its respective port (3001–3005).  
You should see `Listening on Port XXXX......` in each terminal.

> **Tip:** You only need **one node** to explore the basic blockchain API. Start just `node_1` if you want a simple single-node demo.

---

### Connecting Nodes

Nodes are independent until you connect them into a network.  
Send the following request to **any one node** (e.g. Node 1) to have it broadcast itself to the others:

```sh
# Register Node 2 into the network (repeat for nodes 3, 4, 5)
curl -X POST http://localhost:3001/register-and-broadcast-node \
     -H "Content-Type: application/json" \
     -d '{"newNodeUrl": "http://localhost:3002"}'

curl -X POST http://localhost:3001/register-and-broadcast-node \
     -H "Content-Type: application/json" \
     -d '{"newNodeUrl": "http://localhost:3003"}'

curl -X POST http://localhost:3001/register-and-broadcast-node \
     -H "Content-Type: application/json" \
     -d '{"newNodeUrl": "http://localhost:3004"}'

curl -X POST http://localhost:3001/register-and-broadcast-node \
     -H "Content-Type: application/json" \
     -d '{"newNodeUrl": "http://localhost:3005"}'
```

After this, every node knows about all other nodes.

---

### Creating Transactions

Broadcast a new transaction to all nodes at once:

```sh
curl -X POST http://localhost:3001/transaction/broadcast \
     -H "Content-Type: application/json" \
     -d '{
           "amount": 100,
           "sender": "ALICE_ADDRESS",
           "recipient": "BOB_ADDRESS"
         }'
```

The transaction is now in the **pending pool** on every node.  
It will be confirmed (included in a block) when the next block is mined.

---

### Mining a Block

Trigger proof-of-work mining on any node:

```sh
curl http://localhost:3001/mine
```

This will:
1. Gather all pending transactions.
2. Run the proof-of-work algorithm (find a nonce that produces a hash starting with `0000`).
3. Create a new block and add it to Node 1's chain.
4. Broadcast the new block to all connected nodes.
5. Send a **12.5-coin reward** transaction to the miner's address.

You can verify the chain was extended:
```sh
curl http://localhost:3001/blockchain
```

---

### Consensus — Syncing Nodes

If a node falls behind (e.g. it was restarted), call `/consensus` to pull the
longest valid chain from the network:

```sh
curl http://localhost:3002/consensus
```

---

### Using the Block Explorer

With at least Node 1 running, open your browser to:

```
http://localhost:3001/block-explorer
```

You can search by:
- **Block Hash** — paste a hash from `/blockchain` output
- **Transaction ID** — from a `/transaction/broadcast` response
- **Address** — any sender/recipient string you used

---

### Running Tests

Unit tests cover all core blockchain logic using Jest:

```sh
npm test
```

Expected output:
```
PASS  dev/blockchain.test.js
  Blockchain – createNewBlock       (3 tests)
  Blockchain – getLastBlock         (2 tests)
  Blockchain – createNewTransaction (3 tests)
  ...
  
Test Suites: 1 passed
Tests:       20 passed
```

> Some tests run proof-of-work — allow up to 60 seconds for the full suite.

---

### Debugging in VS Code

This repo now includes ready-to-use debugger configs in [.vscode/launch.json](.vscode/launch.json) and tasks in [.vscode/tasks.json](.vscode/tasks.json).

How to use:
1. Open Run and Debug in VS Code.
2. Choose one of:
   - `API Node 1 (3001)` through `API Node 5 (3005)`
   - `Launch 3-node network` (compound launch)
   - `Jest: Current File`
3. Set breakpoints in [dev/api.js](dev/api.js), [dev/blockchain.js](dev/blockchain.js), or [dev/security.js](dev/security.js).
4. Press `F5` to start debugging.

Optional secure-mode debug:
- Add env vars in launch config:
  - `REQUIRE_API_KEY=true`
  - `API_KEY=<your-secret>`
- Send header `x-api-key: <your-secret>` on API calls.



<!-- API REFERENCE -->
## API Reference

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| GET | `/blockchain` | — | Full chain + pending transactions |
| POST | `/transaction` | `{ amount, sender, recipient, transactionId }` | Add a single transaction to pending |
| POST | `/transaction/broadcast` | `{ amount, sender, recipient }` | Create + broadcast transaction to all nodes |
| GET | `/mine` | — | Run PoW, create block, broadcast, pay miner reward |
| POST | `/mine-broadcast` | `{ newBlock }` | Accept a mined block from another node |
| GET | `/consensus` | — | Adopt the longest valid chain on the network |
| POST | `/register-and-broadcast-node` | `{ newNodeUrl }` | Join an existing network |
| POST | `/register-node` | `{ newNodeUrl }` | Register a single peer (internal) |
| POST | `/register-nodes-bulk` | `{ allNetworkNodes }` | Register multiple peers (internal) |
| GET | `/block/:blockHash` | `:blockHash` | Lookup a block by hash |
| GET | `/transaction/:transactionId` | `:transactionId` | Lookup a transaction by ID |
| GET | `/address/:address` | `:address` | Get all transactions + balance for an address |
| GET | `/block-explorer` | — | Serve the Block Explorer web UI |



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/mascarenhasneil/Blockchain/issues) for a list of proposed features and known issues.

Potential enhancements:
- [ ] Wallet management with asymmetric cryptography (public/private key pairs)
- [ ] Transaction signing and signature verification
- [ ] Adjustable mining difficulty
- [ ] Persistence — save chain to disk so it survives restarts
- [ ] WebSocket-based real-time block broadcasting
- [ ] Docker Compose setup for easy multi-node launch



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- CODE OF CONDUCT -->
## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.



<!-- SECURITY -->
## Security

Please review the [Security Policy](SECURITY.md) before reporting vulnerabilities.  
Do **not** open a public issue for security bugs — follow the responsible disclosure process described in [SECURITY.md](SECURITY.md).

Optional API authentication for local secure demos:
- Set `REQUIRE_API_KEY=true`
- Set `API_KEY=<your-secret>`
- Send header `x-api-key: <your-secret>` on API calls



<!-- LICENSE -->
## License

Distributed under the MIT License. See **[LICENSE](https://github.com/mascarenhasneil/Blockchain/blob/master/LICENSE)** for more information.



<!-- CONTACT -->
## Contact

Neil Mascarenhas — [About me?](https://about.me/neilmascarenhas)

Project Link: [https://github.com/mascarenhasneil/Blockchain](https://github.com/mascarenhasneil/Blockchain)


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* BC — Blockchain Community [blockchain.community](https://blockchain.community/)
* [Book:](https://g.co/kgs/6bsWDA) *Blockchain: Blueprint for a New Economy* — Melanie Swan
* [Book:](https://g.co/kgs/auGnMY) *Blockchain Basics: A Non-Technical Introduction in 25 Steps* — Daniel Drescher
* [Book:](https://aantonop.com/books/mastering-bitcoin/) *Mastering Bitcoin* — Andreas M. Antonopoulos
* Eric Traub — [codingjavascript.com](https://codingjavascript.com/)
* Hasib Anwar — [101blockchains.com](https://101blockchains.com/ultimate-blockchain-technology-guide/)
* Bitcoin whitepaper — [bitcoin.org/bitcoin.pdf](https://bitcoin.org/bitcoin.pdf)
* Interactive blockchain demo — [andersbrownworth.com/blockchain](https://andersbrownworth.com/blockchain)



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links 
https://github.com/mascarenhasneil/Blockchain
-->
[contributors-shield]: https://img.shields.io/github/contributors/mascarenhasneil/Blockchain.svg?style=flat-square
[contributors-url]: https://github.com/mascarenhasneil/Blockchain/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/mascarenhasneil/Blockchain.svg?style=flat-square
[forks-url]: https://github.com/mascarenhasneil/Blockchain/network/members
[stars-shield]: https://img.shields.io/github/stars/mascarenhasneil/Blockchain.svg?style=flat-square
[stars-url]: https://github.com/mascarenhasneil/Blockchain/stargazers
[issues-shield]: https://img.shields.io/github/issues/mascarenhasneil/Blockchain.svg?style=flat-square
[issues-url]: https://github.com/mascarenhasneil/Blockchain/issues
[license-shield]: https://img.shields.io/github/license/mascarenhasneil/Blockchain.svg?style=flat-square
[license-url]: https://github.com/mascarenhasneil/Blockchain/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/neilmascarenhas/

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links 
https://github.com/mascarenhasneil/Blockchain
-->
[contributors-shield]: https://img.shields.io/github/contributors/mascarenhasneil/Blockchain.svg?style=flat-square
[contributors-url]: https://github.com/mascarenhasneil/Blockchain/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/mascarenhasneil/Blockchain.svg?style=flat-square
[forks-url]: https://github.com/mascarenhasneil/Blockchain/network/members
[stars-shield]: https://img.shields.io/github/stars/mascarenhasneil/Blockchain.svg?style=flat-square
[stars-url]: https://github.com/mascarenhasneil/Blockchain/stargazers
[issues-shield]: https://img.shields.io/github/issues/mascarenhasneil/Blockchain.svg?style=flat-square
[issues-url]: https://github.com/mascarenhasneil/Blockchain/issues
[license-shield]: https://img.shields.io/github/license/mascarenhasneil/Blockchain.svg?style=flat-square
[license-url]: https://github.com/mascarenhasneil/Blockchain/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/mascarenhasneil
