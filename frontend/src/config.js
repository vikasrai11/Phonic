import axios from "axios";

// Pinata API Credentials (Replace with your actual keys)
const PINATA_API_KEY = "f8635393d49880a6cabb";
const PINATA_SECRET_API_KEY = "ceae77498c5502b21464e050cd6c2af36f1dfe5538b0db0cd62e1e820362c1ab";

export const uploadToPinata = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return response.data; // Should contain IpfsHash
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};
