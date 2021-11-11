import {
	Box,
	Button,
	Divider,
	Heading,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Text,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { ChainId, useEthers, useSendTransaction } from "@usedapp/core";
import { ethers, providers, utils } from "ethers";
import React, { useReducer } from "react";
import { NftyPass as LOCAL_CONTRACT_ADDRESS } from "hardhat/scripts/contractAddress";
import NftyPassContract from "../artifacts/contracts/NftyPass.sol/NftyPass.json";
import NftyHalloweenContract from "../artifacts/contracts/NftyHalloween.sol/NftyHalloween.json";
import { Layout } from "../components/layout/Layout";
import { NftyHalloween as NftyHalloweenContractType, NftyPass as NftyPassContractType } from "../types/typechain";

/**
 * Constants & Helpers
 */

const localProvider = new providers.StaticJsonRpcProvider("http://localhost:8545");

const RINKEBY_PASS_CONTRACT_ADDRESS = "0xD4df0E9F050D285E07E0089B4b889EbDA646E162";

const RINKEBY_HALLOWEEN_CONTRACT_ADDRESS = "0x8C8Ecbd1d722C4e3258bAAf10d154c3D31b4cF1E";

/**
 * Prop Types
 */
interface PassInfo {
	id: number;
	isUsed: boolean;
}

type StateType = {
	tokenPrice: string;
	tokenSupply: string;
	maxSupply: string;
	txHashValue: string;
	isLoading: boolean;
	numOfPasses: number;
	allPasses: PassInfo[];
	halloweenTxHashValue: string;
	allHalloweenNFTs: number[];
};

type ActionType =
	| {
			type: "SET_TOKEN_PRICE";
			tokenPrice: StateType["tokenPrice"];
	  }
	| {
			type: "SET_TOKEN_SUPPLY";
			tokenSupply: StateType["tokenSupply"];
	  }
	| {
			type: "SET_MAX_SUPPLY";
			maxSupply: StateType["maxSupply"];
	  }
	| {
			type: "SET_TX_HASH_VALUE";
			txHashValue: StateType["txHashValue"];
	  }
	| {
			type: "SET_LOADING";
			isLoading: StateType["isLoading"];
	  }
	| {
			type: "SET_PASSES";
			numOfPasses: StateType["numOfPasses"];
	  }
	| {
			type: "SET_ALL_PASSES";
			allPasses: StateType["allPasses"];
	  }
	| {
			type: "UPDATE_PASS";
			updateId: number;
	  }
	| {
			type: "SET_HALLOWEEN_TX_HASH_VALUE";
			halloweenTxHashValue: StateType["halloweenTxHashValue"];
	  }
	| {
			type: "SET_ALL_HALLOWEEN_NFTS";
			allHalloweenNFTs: StateType["allHalloweenNFTs"];
	  };

/**
 * Component
 */
const initialState: StateType = {
	tokenPrice: "",
	tokenSupply: "",
	maxSupply: "",
	txHashValue: "-",
	isLoading: false,
	numOfPasses: 1,
	allPasses: [],
	halloweenTxHashValue: "-",
	allHalloweenNFTs: [],
};

function reducer(state: StateType, action: ActionType): StateType {
	switch (action.type) {
		// Track the greeting from the blockchain
		case "SET_TOKEN_PRICE":
			return {
				...state,
				tokenPrice: action.tokenPrice,
			};
		case "SET_TOKEN_SUPPLY":
			return {
				...state,
				tokenSupply: action.tokenSupply,
			};
		case "SET_MAX_SUPPLY":
			return {
				...state,
				maxSupply: action.maxSupply,
			};

		case "SET_TX_HASH_VALUE":
			return {
				...state,
				txHashValue: action.txHashValue,
			};
		case "SET_LOADING":
			return {
				...state,
				isLoading: action.isLoading,
			};
		case "SET_PASSES":
			return {
				...state,
				numOfPasses: action.numOfPasses,
			};
		case "SET_ALL_PASSES":
			return {
				...state,
				allPasses: action.allPasses,
			};
		case "UPDATE_PASS": {
			const allPasses = state.allPasses;
			allPasses.find((p) => p.id === action.updateId).isUsed = true;
			return {
				...state,
				allPasses,
			};
		}
		case "SET_HALLOWEEN_TX_HASH_VALUE":
			return {
				...state,
				halloweenTxHashValue: action.halloweenTxHashValue,
			};
		case "SET_ALL_HALLOWEEN_NFTS":
			return {
				...state,
				allHalloweenNFTs: action.allHalloweenNFTs,
			};
		default:
			throw new Error();
	}
}

function HomeIndex(): JSX.Element {
	const [state, dispatch] = useReducer(reducer, initialState);
	const { account, chainId, library } = useEthers();

	const isLocalChain = chainId === ChainId.Localhost || chainId === ChainId.Hardhat;

	const PASS_CONTRACT_ADDRESS = chainId === ChainId.Rinkeby ? RINKEBY_PASS_CONTRACT_ADDRESS : LOCAL_CONTRACT_ADDRESS;

	const HALLOWEEN_CONTRACT_ADDRESS =
		chainId === ChainId.Rinkeby ? RINKEBY_HALLOWEEN_CONTRACT_ADDRESS : LOCAL_CONTRACT_ADDRESS;

	// Use the localProvider as the signer to send ETH to our wallet
	const { sendTransaction } = useSendTransaction({
		signer: localProvider.getSigner(),
	});

	// call the smart contract, read the current greeting value
	async function fetchTokenPrice() {
		if (library) {
			const contract = new ethers.Contract(
				PASS_CONTRACT_ADDRESS,
				NftyPassContract.abi,
				library,
			) as NftyPassContractType;
			try {
				const data = await contract.PRICE();
				dispatch({ type: "SET_TOKEN_PRICE", tokenPrice: data.toString() });
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("Error: ", err);
			}
		}
	}

	// call the smart contract, read the current greeting value
	async function fetchTokenSupply() {
		if (library) {
			const contract = new ethers.Contract(
				PASS_CONTRACT_ADDRESS,
				NftyPassContract.abi,
				library,
			) as NftyPassContractType;
			try {
				const data1 = await contract.totalSupply();
				dispatch({ type: "SET_TOKEN_SUPPLY", tokenSupply: data1.toString() });

				const data2 = await contract.MAX_TOKENS();
				dispatch({ type: "SET_MAX_SUPPLY", maxSupply: data2.toString() });
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("Error: ", err);
			}
		}
	}

	// call the smart contract, read the current greeting value
	async function mintTokens() {
		if (library) {
			const contract = new ethers.Contract(
				PASS_CONTRACT_ADDRESS,
				NftyPassContract.abi,
				library,
			) as NftyPassContractType;
			try {
				const value = await contract.PRICE();

				let data;
				if (state.numOfPasses == 1) {
					data = await contract.connect(library.getSigner()).safeMint(account, { value });
				} else {
					data = await contract.connect(library.getSigner()).batchSafeMint(state.numOfPasses, account, {
						value: value.mul(state.numOfPasses),
					});
				}

				dispatch({ type: "SET_TX_HASH_VALUE", txHashValue: data.hash });
				await data.wait();
				await fetchTokenSupply();
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("Error: ", err);
				window.alert(err);
			}
		}
	}

	async function listAllTokens() {
		if (library) {
			const passContract = new ethers.Contract(
				PASS_CONTRACT_ADDRESS,
				NftyPassContract.abi,
				library,
			) as NftyPassContractType;

			const halloweenContract = new ethers.Contract(
				HALLOWEEN_CONTRACT_ADDRESS,
				NftyHalloweenContract.abi,
				library,
			) as NftyHalloweenContractType;
			try {
				const data = await passContract.tokensOfOwner(account);
				const allPasses = data.map((pass) => pass.toNumber());
				const passInfo: PassInfo[] = [];
				for (const pass of allPasses) {
					try {
						await halloweenContract.claimedPass(pass);
						passInfo.push({ id: pass, isUsed: true });
					} catch (e) {
						console.warn(e);
						passInfo.push({ id: pass, isUsed: false });
					}
				}

				dispatch({ type: "SET_ALL_PASSES", allPasses: passInfo });
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("Error: ", err);
			}
		}
	}

	async function mintHalloweenNFT(nftyPass: number) {
		if (library) {
			const contract = new ethers.Contract(
				HALLOWEEN_CONTRACT_ADDRESS,
				NftyHalloweenContract.abi,
				library,
			) as NftyHalloweenContractType;
			try {
				const data = await contract.connect(library.getSigner()).mint(nftyPass);

				dispatch({ type: "SET_HALLOWEEN_TX_HASH_VALUE", halloweenTxHashValue: data.hash });
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("Error: ", err);
			}
		}
	}

	async function listAllHalloweenTokens() {
		if (library) {
			const halloweenContract = new ethers.Contract(
				HALLOWEEN_CONTRACT_ADDRESS,
				NftyHalloweenContract.abi,
				library,
			) as NftyHalloweenContractType;
			try {
				const data = await halloweenContract.tokensOfOwner(account);
				const allNFTs = data.map((pass) => pass.toNumber());

				dispatch({ type: "SET_ALL_HALLOWEEN_NFTS", allHalloweenNFTs: allNFTs });
			} catch (err) {
				// eslint-disable-next-line no-console
				console.log("Error: ", err);
			}
		}
	}

	function sendFunds(): void {
		sendTransaction({
			to: account,
			value: utils.parseEther("0.1"),
		});
	}

	return (
		<Layout>
			<Heading as="h1" mb="8">
				NftyVillage - Next.js Ethereum Starter
			</Heading>
			<Button
				as="a"
				size="lg"
				colorScheme="teal"
				variant="outline"
				href="https://github.com/protokol/nextjs-eth-typescript-react-starter-kit"
				target="_blank"
				rel="noopener noreferrer"
			>
				Source code!
			</Button>
			<Text mt="8" fontSize="xl">
				Connect your wallet first! This page only works on the RINKEBY Testnet or on a Local Chain.
			</Text>
			<Box maxWidth="container.xm" p="8" mt="8" bg="gray.100">
				<Link href={`https://rinkeby.etherscan.io/address/${PASS_CONTRACT_ADDRESS}`} isExternal>
					NFTY Pass Contract Address: <br />
					{PASS_CONTRACT_ADDRESS} <ExternalLinkIcon mx="2px" />
				</Link>

				<Divider my="8" borderColor="gray.400" />

				<Link href={`https://rinkeby.etherscan.io/address/${HALLOWEEN_CONTRACT_ADDRESS}`} isExternal>
					NFTY Halloween Contract Address: <br />
					{HALLOWEEN_CONTRACT_ADDRESS} <ExternalLinkIcon mx="2px" />
				</Link>

				<Divider my="8" borderColor="gray.400" />

				<Box>
					<Text fontSize="lg">NFTY Pass Token Price: {state.tokenPrice}</Text>
					<Button mt="2" colorScheme="teal" onClick={fetchTokenPrice}>
						Fetch Token Minting Price
					</Button>
				</Box>
				<Divider my="8" borderColor="gray.400" />
				<Box>
					<Text fontSize="lg">
						NFTY Pass Minted supply: {state.tokenSupply} | Maximum Supply: {state.maxSupply}{" "}
					</Text>
					<Button mt="2" colorScheme="teal" onClick={fetchTokenSupply}>
						Fetch Data
					</Button>
				</Box>

				<Divider my="8" borderColor="gray.400" />
				<Box>
					<Text mt="6">Number of NftyPasses:</Text>
					<NumberInput
						size="lg"
						maxW={32}
						background={"white"}
						max={5}
						min={1}
						value={state.numOfPasses}
						onChange={(e) => {
							dispatch({
								type: "SET_PASSES",
								numOfPasses: +e,
							});
						}}
					>
						<NumberInputField />
						<NumberInputStepper>
							<NumberIncrementStepper />
							<NumberDecrementStepper />
						</NumberInputStepper>
					</NumberInput>
					<Button
						mt="2"
						mb="3"
						as="a"
						size="lg"
						colorScheme="teal"
						isLoading={state.isLoading}
						onClick={mintTokens}
					>
						Mint/Buy Tokens
					</Button>
				</Box>
				<Box>
					<Link mt="2" href={`https://rinkeby.etherscan.io/tx/${state.txHashValue}`} isExternal>
						Transaction: {state.txHashValue} <ExternalLinkIcon mx="4px" />
					</Link>
				</Box>

				<Divider my="8" borderColor="gray.400" />

				<Button colorScheme="teal" onClick={listAllTokens}>
					List my NftyPasses
				</Button>

				<Box>
					<Text mt="6">
						The buttons below represent the nfty passes you own.
						<br />
						By clicking on the button you are able to mint a Halloween NFT from the NFTY Village of
						Alpacria:
					</Text>
					{state.allPasses.map((pass) => (
						<Button
							key={pass.toString()}
							isDisabled={pass.isUsed}
							onClick={async () => {
								await mintHalloweenNFT(pass.id);
								dispatch({ type: "UPDATE_PASS", updateId: pass.id });
							}}
							colorScheme="teal"
							size="sm"
							mt="2"
							mr="2"
						>
							Mint Halloween NFT: {pass.id}
						</Button>
					))}
				</Box>
				<Box mt="4">
					<Link href={`https://rinkeby.etherscan.io/tx/${state.halloweenTxHashValue}`} isExternal>
						Transaction: {state.halloweenTxHashValue} <ExternalLinkIcon mx="4px" />
					</Link>
				</Box>

				<Divider my="8" borderColor="gray.400" />

				<Button colorScheme="teal" onClick={listAllHalloweenTokens}>
					List my Halloween NFT set
				</Button>

				<Text mt="4">List of my NFTY Halloween NFTs:</Text>

				{state.allHalloweenNFTs.map((nft) => (
					<Link
						key={nft.toString()}
						href={`https://rinkeby.etherscan.io/token/${HALLOWEEN_CONTRACT_ADDRESS}?a=${nft}`}
						isExternal
						mt="2"
						mr="2"
					>
						{nft}
					</Link>
				))}

				<Divider my="8" borderColor="gray.400" />

				<Text mb="4">This button only works on a Local Chain.</Text>
				<Button colorScheme="teal" onClick={sendFunds} isDisabled={!isLocalChain}>
					Send Funds From Local Hardhat Chain
				</Button>
			</Box>
		</Layout>
	);
}

export default HomeIndex;
