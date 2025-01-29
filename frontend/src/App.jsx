import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload an audio file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("audio_file", file);

    try {
      // Send the file to the FastAPI backend
      const response = await axios.post(
        "http://localhost:8000/detect-stuttering/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Set the result
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
      <h1>Phonic Forge🎤</h1>
      <p>Upload an audio file to detect stuttering types (Upto 5 supported).</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="file" accept="audio/*" onChange={handleFileChange} style={styles.fileInput} />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Processing..." : "Upload and Detect"}
        </button>
      </form>

      {result && (
        <div style={styles.result}>
          <h2>Results for: {result.filename}</h2>
          <ul>
            {result.detected_stuttering_types.map((type, index) => (
              <li key={index}>{type}</li>
            ))}
          </ul>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}

// Basic styles
const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
    color: "black"
  },
  form: {
    margin: "20px 0",
  },
  fileInput: {
    margin: "10px 0",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  result: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
  },
};

export default App;