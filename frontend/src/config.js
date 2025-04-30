import axios from "axios";
import { BrowserProvider, Contract } from "ethers"; 

// Smart Contract details
const CONTRACT_ADDRESS = "Replace with Deployed Contract Address"; 
const ABI = "Replace with Deployed Contract ABI"

// Pinata API Credentials
const PINATA_API_KEY = "Replace with API key";
const PINATA_SECRET_API_KEY = "Replace with secret key";

/**
 * Initialize provider & request wallet access
 */
const initializeProvider = async () => {
  if (!window.ethereum) {
    console.error("MetaMask is not installed.");
    alert("Please install MetaMask to use this feature.");
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum); 
    await provider.send("eth_requestAccounts", []); 
    return provider;
  } catch (error) {
    console.error("Error initializing provider:", error);
    alert("Failed to connect to MetaMask. Check console for details.");
    return null;
  }
};

/**
 * Upload file to Pinata & store IPFS hash in smart contract
 */
export const uploadToPinata = async (file, userName) => {
  if (!userName) {
    throw new Error("User name is required to store the IPFS hash.");
  }

  try {
    // Upload file to Pinata
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    console.log("File uploaded to IPFS:", ipfsHash);

    // Store IPFS hash in smart contract
    await storeIPFSHash(userName, ipfsHash);

    return ipfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

/**
 * Store IPFS hash in smart contract
 */
const storeIPFSHash = async (userName, ipfsHash) => {
  if (!window.ethereum) {
    alert("Please install MetaMask to interact with the blockchain.");
    return;
  }

  try {
    const provider = await initializeProvider();
    if (!provider) return;

    const signer = await provider.getSigner(); 
    const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

    console.log(`Storing IPFS hash on blockchain for ${userName}: ${ipfsHash}`);
    
    const tx = await contract.setIPFSHash(userName, ipfsHash);
    await tx.wait();
    
    console.log(`Successfully stored IPFS hash for ${userName}: ${ipfsHash}`);
  } catch (error) {
    console.error("Error storing IPFS hash on blockchain:", error);
  }
};


initializeProvider().then(provider => {
  if (provider) {
    console.log("Ethereum provider initialized:", provider);
  }
});

console.log("Ethers object:", { BrowserProvider, Contract });
