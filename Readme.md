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
  <a href="https://github.com/mascarenhasneil/Blockchain">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Blcokchain</h3>

  <p align="center">
    An awesome README template to jumpstart your projects!
    <br />
    <a href="https://github.com/mascarenhasneil/Blockchain"><strong>Explore the docs »</strong></a>
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
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)




<!-- ABOUT THE PROJECT -->
## About The Project

In this project you will see all of the following concepts and the blockchain will have all of the following features below:

### Blockchain Essentials
[![Product Name Screen Shot][product-screenshot]](https://101blockchains.com/wp-content/uploads/2018/07/How_Does_a_Blockchain_work-702x336.jpg "Blockchain Essentials courtesy:101blockchains.com")


* A Proof-of-Work Algorithm to secure the network.
* Hashing algorithms to secure the data within the blockchain we are using SHA256 algotithm for hashing.
* Mine (to create) new blocks that contain transaction data.
* Create transactions and store them in blocks.
* An API/server to interact with the blockchain from the internet (We are using localhost for demo).
* Hosted on a decentralized blockchain network.
* A consensus algorithms, verifying that the network nodes have valid data and are synchronized.
* A broadcasting system, keeping the data in the blockchain network synchronized.


### Built With
This section lists major frameworks that built this project using. 

* [NodeJs](https://nodejs.org)
* [Bootstrap](https://getbootstrap.com)
* [JQuery](https://jquery.com)
* [AngularJs](https://angularjs.org/)



<!-- GETTING STARTED -->
## Getting Started

This project can run locally or on a server setting up your project locally is very easy.
To get a local copy up and running follow these simple steps below.


### Prerequisites

For this project nodejs is must. The official link to download and install nodejs is [nodejs.org/en/download/current](https://nodejs.org/en/download/current)


* npm
```sh
npm install npm@latest -g
```


### Installation

Installation of this project is easy. 

1. Clone the repo
```sh
git clone https://github.com/mascarenhasneil/blockchain.git
```

2. Install NPM packages - this will install all dependencies 
```sh
npm install
```


<!-- USAGE EXAMPLES -->
## Usage

Using this app and starting your own block chain is very easy.

1. I have pre-created 5 nodes for this network. If needed you can add more. Do this  by addding this to package.json file.
For example:
```sh
node_<Number>": "nodemon --watch dev -e js dev/api.js <Port Number>  http://localhost:<Port Number>"
```

2. We need to run each node in different terminal so to create a network. To start the node enter this command. 
For node 1:
```sh
npm run node_1
```
Follow this by replacing the number of each node till all nodes are running.


3. I need a break, having a coffee. brb




<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/mascarenhasneil/Blockchain/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See **[LICENSE](https://github.com/mascarenhasneil/Blockchain/blob/master/LICENSE)** for more information.



<!-- CONTACT -->
## Contact

Neil Mascarenhas - [About me?](https://about.me/neilmascarenhas)

Project Link: [https://github.com/mascarenhasneil/Blockchain](https://github.com/mascarenhasneil/Blockchain)


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [BC - also known as Blockchain Community](https://blockchain.community/)
* [Book: Blockchain: Blueprint for a New Economy- Book by Melanie Swan](https://g.co/kgs/6bsWDA) [You can buy book here - no strings attached.](http://shop.oreilly.com/product/0636920037040.do) 
* [Book: Blockchain Basics: A Non-Technical Introduction in 25 Steps- Book by Daniel Drescher](https://g.co/kgs/auGnMY)
* [Eric Traub - codingjavascript.com](https://codingjavascript.com/)
* [Hasib Anwar - 101blockchains.com](https://101blockchains.com/ultimate-blockchain-technology-guide/)





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
[license-url]: https://github.com/mascarenhasneil/Blockchain/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/mascarenhasneil
