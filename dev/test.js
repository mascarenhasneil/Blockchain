const Blockchain = require('./blockchain');
const bitcoin= new Blockchain();

const prevousBlockHash='JFFDDSF5G44545F45454G54F5F45HG451V5G4';
const currentBlockData=[
    {
        ammount:15245,
        sender:'dhdhjffjkfsjfh',
        rec:'dhfjhdjfhsfhskj'
    },
    {
        ammount:100,
        sender:'dhdhjffjkfsjfh',
        rec:'dhfjhdjfhsfhskj'
    },
    {
        ammount:5000000,
        sender:'dhdhjffjkfsjfh',
        rec:'dhfjhdjfhsfhskj'
    }
] 

const nounce=bitcoin.proofOfWork(prevousBlockHash,currentBlockData);
console.log(nounce);
console.log(bitcoin.hashBlock(prevousBlockHash,currentBlockData,nounce))




