/**
 * @type import('hardhat/config').HardhatUserConfig
 */

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "dotenv/config";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/types";
import "solidity-coverage";

import "./tasks/accounts";
import "./tasks/balance";
import "./tasks/block-number";

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/your-api-key";
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://eth-rinkeby.alchemyapi.io/v2/your-api-key";
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL || "https://eth-kovan.alchemyapi.io/v2/your-api-key";
const ROPSTEN_RPC_URL = process.env.ROPSTEN_RPC_URL || "https://eth-ropsten.alchemyapi.io/v2/your-api-key";
const MNEMONIC = process.env.MNEMONIC || "your mnemonic";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
// optional
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const COIN_MARKET_CAP = process.env.COIN_MARKET_CAP;
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			// // If you want to do some forking, uncomment this
			// forking: {
			//   url: MAINNET_RPC_URL
			// }
		},
		localhost: {
			url: "http://127.0.0.1:8545",
		},
		ropsten: {
			url: ROPSTEN_RPC_URL,
			accounts: PRIVATE_KEY ? [PRIVATE_KEY] : { mnemonic: MNEMONIC },
			gas: 2100000,
			gasPrice: 8000000000,
		},
		kovan: {
			url: KOVAN_RPC_URL,
			accounts: PRIVATE_KEY ? [PRIVATE_KEY] : { mnemonic: MNEMONIC },
		},
		rinkeby: {
			url: RINKEBY_RPC_URL,
			accounts: PRIVATE_KEY ? [PRIVATE_KEY] : { mnemonic: MNEMONIC },
		},
		ganache: {
			url: "http://localhost:8545",
			accounts: {
				mnemonic: MNEMONIC,
			},
		},
	},
	etherscan: {
		// Your API key for Etherscan
		// Obtain one at https://etherscan.io/
		apiKey: ETHERSCAN_API_KEY,
	},
	solidity: {
		version: "0.8.9",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	paths: {
		artifacts: "../frontend/artifacts",
	},
	typechain: {
		outDir: "../frontend/types/typechain",
	},
	mocha: {
		timeout: 100000,
	},
	gasReporter: {
		coinmarketcap: COIN_MARKET_CAP,
	},
};

export default config;
