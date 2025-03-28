import React, { useState } from "react";
import axios from "axios";
import { uploadToPinata } from "./config";
import { Bot, Upload, AudioWaveform as Waveform, Sparkles, Loader2 } from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile);
      setIsAnalyzing(false);
    } else {
      alert("Please upload a valid audio file!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !userName) {
      alert("Please provide a name and select an audio file.");
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);

    try {
      await uploadToPinata(file, userName);

      const formData = new FormData();
      formData.append("audio_file", file);

      const response = await axios.post(
        "http://localhost:8000/detect-stuttering/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("An error occurred while processing the file.");
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleOpenResultPage = () => {
    if (!result) return;
     // Ensure detected_stuttering_types is an array
     const detectedStutteringTypes = Array.isArray(result.detected_stuttering_types) ? result.detected_stuttering_types : [];

     // Ensure therapy_suggestions is an array
     const therapySuggestions = Array.isArray(result.therapy_suggestions) ? result.therapy_suggestions : [];
    const resultWindow = window.open("", "_blank");
    if (resultWindow) {
      resultWindow.document.write(`
    
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stuttering Analysis Report</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            color: #333;
            text-align: center;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }
        .background-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }
        .background-container iframe {
            width: 100vw;
            height: 100vh;
            border: none;
        }
        .container {
            max-width: 800px;
            margin: 50px auto;
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
            text-align: left;
        }
        h2 { 
            color: #6b46c1;
            text-align: center;
        }
        .section-title {
            font-weight: bold;
            margin-top: 15px;
        }
        table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th { background-color: #6b46c1; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        ul {
            margin: 10px 0 0 20px;
        }
        li {
            margin-bottom: 5px;
        }
        .download-btn {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #6b46c1;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .download-btn:hover {
            background-color: #553c9a;
        }
    </style>
</head>
<body>
    <div class="background-container">
        <iframe src="https://my.spline.design/hypnotism-ffd40072e3487093b920613c8b5acf7d/" loading="lazy"></iframe>
    </div>
    <div class="container" id="report-content">
        <h2>Stuttering Analysis Report for ${result.filename}</h2>
        <p><span class="section-title">Message:</span> ${result.message}</p>
        
        <p class="section-title">Detected Stuttering Types:</p>
         <table>
                    <tr><th>Stuttering Type</th></tr>
                    ${detectedStutteringTypes.map(type => `<tr><td>${type}</td></tr>`).join("")}
                </table>

        
        <p class="section-title">Speech Therapy Suggestions:</p>
         <table>
                    <tr><th>Stuttering Type</th><th>Suggestions</th></tr>
                    ${therapySuggestions.map((therapy) => `
                        <tr>
                            <td>${therapy.type}</td>
                            <td>
                                <ul>
                                     ${therapy.suggestions && therapy.suggestions.length > 0 
                        ? therapy.suggestions.map((suggestion) => `<li>${suggestion}</li>`).join("") 
                        : "<li>No suggestions available</li>"
                    }
                                </ul>
                            </td>
                        </tr>
                    `).join("")}
                </table>
                

        
        <p class="footer">Generated by PhonicForge - AI & Blockchain-Powered Speech Analysis</p>
    </div>
    <button class="download-btn" onclick="downloadPDF()">Download as PDF</button>
    <div style="height: 500px;"></div>
    <script>
        async function downloadPDF() {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const reportContent = document.getElementById("report-content");
            
            await html2canvas(reportContent, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
            });
            pdf.save("stuttering_analysis_report.pdf");
        }
    </script>
</body>
</html>



        


      `);
      resultWindow.document.close();
    } else {
      alert("Please allow pop-ups to view results.");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 w-full h-full z-0">
        <iframe
          src="https://my.spline.design/soundwave-d54e834888426741ef09594f3825f6d5/"
          className="w-full h-full"
          style={{ border: "none" }}
        />
      </div>

      <div className="relative z-10 min-h-screen backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Bot className="w-10 h-10 text-purple-400" />
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  PhonicForge
                </h1>
              </div>
              <p className="text-gray-300 max-w-2xl">
                Advanced speech stuttering analysis powered by artificial intelligence and blockchain technology
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm text-white"
                    placeholder="Enter your name"
                    required
                    disabled={isAnalyzing}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Upload Audio</label>
                  <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-all backdrop-blur-sm bg-gray-800/30">
                    <input type="file" onChange={handleFileChange} accept="audio/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required disabled={isAnalyzing} />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-400">{file ? file.name : "Drop your audio file here or click to browse"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isAnalyzing} className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium transition-all">
                {isAnalyzing ? "Analyzing..." : "Analyze Speech"}
              </button>
            </form>

            {result && (
              <button onClick={handleOpenResultPage} className="mt-4 text-lg text-purple-400 underline cursor-pointer">
                Click here to view your stuttering report
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-12">
            <div className="p-4 bg-gray-800/30 rounded-lg backdrop-blur-sm border border-gray-700/50">
              <Waveform className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="font-medium mb-2 text-white">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-300">Advanced Algorithms for precise detection</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg backdrop-blur-sm border border-gray-700/50">
              <Bot className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="font-medium mb-2 text-white">Real-time Processing</h3>
              <p className="text-sm text-gray-300">Instant feedback on speech patterns</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg backdrop-blur-sm border border-gray-700/50">
              <Sparkles className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="font-medium mb-2 text-white">Blockchain Secured</h3>
              <p className="text-sm text-gray-300">Your data is encrypted and secure</p>
            </div>
          </div>
          <div className="w-full h-[200px] mt-12">
          <iframe src="https://my.spline.design/blockchain-bdaec85170f0b268ccb607d0d926302d/" className="w-full h-full" style={{ border: "none" }} />
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
