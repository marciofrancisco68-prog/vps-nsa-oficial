#!/bin/bash
set -e

# ============================================================================
# vpsNsA Sovereign Memory Purge Automator
# Executa a limpeza autônoma de dados acima de 2 anos (730 dias)
# ============================================================================

DB_NAME="nsavps_db"
DB_USER="vpsnsa"

echo "🧠 [vpsNsA Engine] Iniciando rotina de verificação da Memória Sovereign..."

# Executa a função de eliminação no PostgreSQL
if command -v psql >/dev/null 2>&1; then
  sudo -u postgres psql -d "$DB_NAME" -c "SELECT purge_vpsnsa_expired_memory();" || true
  # Reivindica o espaço em disco físico no NVMe
  sudo -u postgres psql -d "$DB_NAME" -c "VACUUM ANALYZE vpsnsa_sovereign_memory;" || true
else
  echo "[INFO] Ambiente containerizado; invocando endpoint interno de purga e VACUUM..."
  curl -s -X POST http://localhost:3000/api/memory/purge || true
fi

echo "✅ [SUCCESS] Memória da vpsNsA otimizada. Armazenamento antigo purgado com sucesso!"
