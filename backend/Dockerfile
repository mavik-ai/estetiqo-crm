FROM python:3.11-slim

WORKDIR /app

# Instalar system dependencies pra buildar pacotes (se necessitar)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expõe a porta que o FastAPI deve rodar
EXPOSE 8000

# Executa em modo bind no Gunicorn com workers (Produção Real) para suportar requisições concorrentes
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
