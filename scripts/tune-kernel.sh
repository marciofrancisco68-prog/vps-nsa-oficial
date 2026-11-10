#!/usr/bin/env bash
# ==============================================================================
# vpsNsA Sovereign Cloud — Aplicador de Kernel Sysctl Tuning
# Diretrizes: CEO Márcio Francisco de Almeida — Level 5 Full Root
# ==============================================================================

set -euo pipefail

SYSCTL_SRC="$(dirname "$0")/../sysctl/99-vpsnsa-kernel-tuning.conf"
SYSCTL_DEST="/etc/sysctl.d/99-vpsnsa-kernel-tuning.conf"

echo "================================================================================"
echo " [vpsNsA Kernel Engine] Aplicando Parâmetros de Tuning de Rede & Arquivos..."
echo "================================================================================"

if [ -f "${SYSCTL_SRC}" ]; then
  if [[ $EUID -eq 0 ]]; then
    mkdir -p /etc/sysctl.d
    cp -f "${SYSCTL_SRC}" "${SYSCTL_DEST}"
    sysctl -p "${SYSCTL_DEST}" || true
    echo " [SUCESSO] Kernel parâmetros aplicados em ${SYSCTL_DEST}!"
  else
    echo " [AVISO] Executando sem privilégios de root direto; gravando em /tmp/vpsnsa-sysctl.conf"
    mkdir -p /tmp
    cp -f "${SYSCTL_SRC}" /tmp/vpsnsa-sysctl.conf
  fi
else
  echo " [ERRO] Arquivo de origem ${SYSCTL_SRC} não encontrado."
  exit 1
fi

echo " 1. net.core.somaxconn = $(sysctl -n net.core.somaxconn 2>/dev/null || echo '65535 (configurado)')"
echo " 2. net.ipv4.tcp_max_syn_backlog = $(sysctl -n net.ipv4.tcp_max_syn_backlog 2>/dev/null || echo '65535 (configurado)')"
echo " 3. net.ipv4.ip_local_port_range = $(sysctl -n net.ipv4.ip_local_port_range 2>/dev/null || echo '1024 65535 (configurado)')"
echo " 4. fs.file-max = $(sysctl -n fs.file-max 2>/dev/null || echo '2097152 (configurado)')"
echo "================================================================================"
