# Ollama Setup & Model Configuration Guide

VEYRA Studio relies exclusively on **Ollama** for language model inference. The model name is intentionally left unconfigured in `.env` for you to supply based on your hardware.

## 1. Prerequisites
- Download and install Ollama from [ollama.com](https://ollama.com).
- Verify the Ollama service is active:
  ```bash
  curl http://127.0.0.1:11434/api/tags
  ```

## 2. Recommended Models

| Model | Context | Recommended Hardware | Use Case |
| :--- | :--- | :--- | :--- |
| `llama3.2` | 4,096 | 8GB RAM / Apple Silicon M1+ | Fast lightweight web coding |
| `qwen2.5-coder:7b` | 4,096 - 8,192 | 16GB RAM / RTX 3060+ | Exceptional code generation |
| `llama3.3:70b` | 4,096 - 8,192 | 64GB RAM / RTX 4090+ or Mac Studio | Maximum reasoning & planning |
| `deepseek-r1:8b` | 4,096 | 16GB RAM | Deep chain-of-thought analysis |

Pull your preferred model:
```bash
ollama pull llama3.2
# or
ollama pull qwen2.5-coder:7b
```

## 3. Configuration in VEYRA Studio
Edit `.env.local`:
```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
OLLAMA_NUM_CTX=4096
OLLAMA_TEMPERATURE=0.2
OLLAMA_TIMEOUT_MS=120000
OLLAMA_KEEP_ALIVE=5m
```

## 4. Troubleshooting
- **Model Missing Error**: If `OLLAMA_MODEL` is blank or the model has not been pulled, VEYRA displays a helpful error card guiding you to run `ollama pull <model>`.
- **Connection Refused**: Ensure Ollama is running (`ollama serve`) and accessible at `http://127.0.0.1:11434`.
- **Timeout**: For larger models on CPUs, increase `OLLAMA_TIMEOUT_MS=180000` (3 minutes).
