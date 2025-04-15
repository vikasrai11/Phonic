# Final Year Project BABY

# 🎙️ PhonicForge 🔍

**PhonicForge** is an AI-powered web platform that detects and classifies stuttering from voice input while providing personalized remediation. It integrates **speech processing, machine learning, and blockchain** to ensure **secure, accurate, and accessible speech therapy solutions**.

---

## 🚀 Features

✅ **Real-time Voice Analysis** – AI-powered speech pattern detection.  
✅ **Stuttering Classification** – Identifies different types of stuttering.  
✅ **Remediation Assistance** – Provides personalized exercises and feedback.  
✅ **Blockchain Integration** – Securely stores and accesses voice data.  
✅ **Web-Based Interface** – Fully responsive and accessible across devices.

---

## 🛠️ Tech Stack

| Component              | Technology Used              |
| ---------------------- | ---------------------------- |
| 🎨 **Frontend**        | React, TailwindCSS           |
| 🔧 **Backend**         | Python, Fast API             |
| 🤖 **AI/ML**           | TensorFlow, DeepSpeech, LSTM |
| 🔗 **Blockchain**      | Ethereum                     |
| 🗄️ **Pinning Service** | Pinata                       |

---

## 🛠️ Setup & Installation

### 📌 1️⃣ Clone the Repository

```bash
git clone https://github.com/vikasrai11/PhonicForge.git
cd PhonicForge
```

### 🎨 2️⃣ Setup the Frontend

```bash
cd frontend
npm install
npm run dev
```

### 🖥️ 3️⃣ Setup the Backend

```bash
cd backend
python -m venv venv  #First time installation
source venv/bin/activate  # On Windows: venv\Scripts\activate  #To start server each time
pip install streamlit torch torchaudio librosa numpy
pip install python-multipart
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload  #To start server each time
```

### 🤖 4️⃣ Setup the local BLockchain Server (Anvil)

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
anvil
```

RPC URL- http://127.0.0.1:8545.
default chain ID - 31337.
Install and setup metamask in browser.
Add anvil network into metamask.
Import anvil account into metamask.
