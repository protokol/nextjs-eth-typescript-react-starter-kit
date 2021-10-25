import { ethers, web3 } from "hardhat";
import { Signer } from "ethers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { chaiEthers } from "chai-ethers";

import { NftyPass, NftyPass__factory } from "frontend/types/typechain";

chai.use(chaiEthers);
chai.use(chaiAsPromised);
const { expect } = chai;

describe("NftyPass", function () {
  let accounts: Signer[];
  let nftyPassContract: NftyPass;
  const uri = "www.placeholder.com/";

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    const nftTokenFactory = (await ethers.getContractFactory(
      "NftyPass",
      accounts[0]
    )) as NftyPass__factory;

    nftyPassContract = await nftTokenFactory.deploy(uri);
  });

  describe("Init", function () {
    it("Should get MAX_TOKENS initialized in constructor", async function () {
      const maxTokens = await nftyPassContract.MAX_TOKENS();

      expect(maxTokens).to.equal("9000");
    });
  });

  describe("safeMint", function () {
    it("Should Increase Total Supply When Minting", async function () {
      const value = await nftyPassContract.PRICE();

      expect(await nftyPassContract.totalSupply()).to.equal(0);

      await nftyPassContract.safeMint(
        "0xd1ed25240ecfa47fD2d46D34584c91935c89546c",
        { value }
      );

      await nftyPassContract.safeMint(
        "0xd1ed25240ecfa47fD2d46D34584c91935c89546c",
        { value }
      );

      await nftyPassContract.safeMint(
        "0xd1ed25240ecfa47fD2d46D34584c91935c89546c",
        { value }
      );

      expect(await nftyPassContract.totalSupply()).to.equal(3);
    });

    it("Should Reject if value is to low", async function () {
      let value = await nftyPassContract.PRICE();
      value = value.sub("1");

      expect(
        nftyPassContract
          .connect(accounts[1])
          .safeMint(await accounts[0].getAddress(), {
            value,
          })
      ).eventually.to.be.rejectedWith("ETH amount is not sufficient");
    });

    it("Should Reject if safe mint to zero address", async function () {
      const value = await nftyPassContract.PRICE();

      expect(
        nftyPassContract
          .connect(accounts[1])
          .safeMint("0x0000000000000000000000000000000000000000", {
            value,
          })
      ).eventually.to.be.rejectedWith("ERC721: mint to the zero address");
    });

    it("Should Reject if Contract is on pause", async function () {
      const value = await nftyPassContract.PRICE();
      await nftyPassContract.connect(accounts[0]).pause();

      expect(
        nftyPassContract
          .connect(accounts[1])
          .safeMint(await accounts[1].getAddress(), {
            value,
          })
      ).eventually.to.be.rejectedWith();
    });
  });

  describe("batchSafeMint", function () {
    it("Should Successfully batchSafeMint", async function () {
      const value = await nftyPassContract.PRICE();

      expect(await nftyPassContract.totalSupply()).to.equal(0);

      await nftyPassContract.batchSafeMint(
          20,
          await accounts[0].getAddress(),
          { value: value.mul(20) }
      );

      expect(await nftyPassContract.totalSupply()).to.equal(20);
    });

    it("Should throw ETH amount is not sufficient", async function () {
      const value = await nftyPassContract.PRICE();

      expect(nftyPassContract.batchSafeMint(
          20,
          await accounts[0].getAddress(),
          { value: value.mul(20).sub(1) }
      )).eventually.to.be.rejectedWith("ETH amount is not sufficient");
    });

    it("Should throw Can only mint up to 20 tokens", async function () {
      const value = await nftyPassContract.PRICE();

      expect(nftyPassContract.batchSafeMint(
          21,
          await accounts[0].getAddress(),
          { value: value.mul(21) }
      )).eventually.to.be.rejectedWith("Can only mint up to 20 tokens");
    });
  });

  describe("Base URI", function () {
    it("Should update base uri", async function () {
      const updatedBaseURI = "www.placeholder2.com/";
      const address = await accounts[1].getAddress();
      const value = await nftyPassContract.PRICE();
      await nftyPassContract
        .connect(accounts[1])
        .safeMint(await accounts[1].getAddress(), { value });

      const token = await nftyPassContract.tokenOfOwnerByIndex(address, 0);
      const tokenURI = await nftyPassContract.tokenURI(token);
      expect(tokenURI).to.contain(uri);

      await nftyPassContract.setBaseURI(updatedBaseURI);

      const updatedTokenURI = await nftyPassContract.tokenURI(token);
      expect(updatedTokenURI).to.contain(updatedBaseURI);
    });

    it("Should throw an error if non owner try to update base uri", async function () {
      expect(
        nftyPassContract.connect(accounts[1]).setBaseURI("")
      ).eventually.to.be.rejectedWith();
    });
  });

  describe("tokenURI", function () {
    it("Should Return correct tokenURI", async function () {
      const value = await nftyPassContract.PRICE();
      await nftyPassContract
        .connect(accounts[1])
        .safeMint(await accounts[2].getAddress(), {
          value,
        });
      const tokenURI = await nftyPassContract.connect(accounts[1]).tokenURI(0);

      expect(tokenURI).to.be.eq(`www.placeholder.com/${0}`);
    });
  });

  describe("Withdraw", function () {
    it("Should empty contract balance when withdrawing", async function () {
      const value = await nftyPassContract.PRICE();
      await nftyPassContract
        .connect(accounts[1])
        .safeMint(await accounts[1].getAddress(), { value });

      expect(await web3.eth.getBalance(nftyPassContract.address)).to.equal(
        value.toString()
      );

      const balanceBeforeWithdrawing = await web3.eth.getBalance(
        await accounts[0].getAddress()
      );
      const withdrawCall = await nftyPassContract.withdraw();
      const { gasUsed } = await web3.eth.getTransactionReceipt(
        withdrawCall.hash
      );
      const txFee = withdrawCall.gasPrice!.mul(gasUsed);
      const balanceAfterWithdrawing = await web3.eth.getBalance(
        await accounts[0].getAddress()
      );

      expect(await web3.eth.getBalance(nftyPassContract.address)).to.equal("0");
      expect(value.add(balanceBeforeWithdrawing).sub(txFee)).to.equal(
        balanceAfterWithdrawing
      );
    });

    it("Should throw an error if non contract owner tries to withdraw funds", async function () {
      await nftyPassContract
        .connect(accounts[1])
        .safeMint(await accounts[1].getAddress(), {
          value: nftyPassContract.PRICE(),
        });

      expect(
        nftyPassContract.connect(accounts[1]).withdraw()
      ).eventually.to.be.rejectedWith();
    });
  });
});
