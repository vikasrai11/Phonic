import React, { useState } from "react";
import axios from "axios";
import { uploadToPinata } from "./config";
import { ClipboardCopy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid audio file!");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ipfsHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy IPFS Hash:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload an audio file first!");
      return;
    }

    setLoading(true);

    try {
      const pinataResponse = await uploadToPinata(file);
      const ipfsHash = pinataResponse.IpfsHash;
      setIpfsHash(ipfsHash);
      console.log("Uploaded to IPFS:", ipfsHash);

      const formData = new FormData();
      formData.append("audio_file", file);
      formData.append("ipfs_hash", ipfsHash);

      const response = await axios.post(
        "http://localhost:8000/detect-stuttering/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while processing the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Phonic Forge</h1>
      <h2>Real-Time Stuttering Detection and Personalized Therapy 🎤</h2>
      <p>Upload an audio file to detect stuttering types and get therapy suggestions.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputContainer}>
          <input type="file" accept="audio/*" onChange={handleFileChange} style={styles.inputField} />
        </div>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Processing..." : "Upload and Detect"}
        </button>
      </form>

      {result && (
        <div style={styles.result}>
          <h2>Results for: {result.filename}</h2>
          <h3>Detected Stuttering Types:</h3>
          <ul>
            {result.detected_stuttering_types.map((type, index) => (
              <li key={index}>{type}</li>
            ))}
          </ul>
          <h3>Speech Therapy Suggestions:</h3>
          <ReactMarkdown>{result.therapy_suggestions}</ReactMarkdown>
          <p>{result.message}</p>
        </div>
      )}

      {ipfsHash && (
        <div style={styles.ipfsSection}>
          <p>
            <strong>IPFS Hash:</strong> {ipfsHash}
          </p>
          <button onClick={handleCopy} className="p-1 hover:bg-gray-200 rounded">
            {copied ? <Check size={16} color="green" /> : <ClipboardCopy size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
    textAlign: "center",
    color: "#333",
    backgroundColor: "#f4f4f4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    marginTop: "20px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "8px 10px",
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "300px",
  },
  inputField: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "1em",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  result: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
    width: "90%",
    maxWidth: "800px",
    textAlign: "left",
  },
  ipfsSection: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

export default App;