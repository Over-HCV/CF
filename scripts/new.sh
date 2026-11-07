#!/usr/bin/env bash
# Uso: scripts/new.sh 2050 [letras]
# Crea contests/2050/{A..F}.cpp desde template.cpp (no pisa archivos existentes).
set -euo pipefail

id="${1:?uso: new.sh ID_CONCURSO [letras, p.ej. ABCDEF]}"
letters="${2:-ABCDEF}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dir="$root/contests/$id"
mkdir -p "$dir"

for ((i = 0; i < ${#letters}; i++)); do
  f="$dir/${letters:i:1}.cpp"
  [[ -e "$f" ]] || cp "$root/template.cpp" "$f"
done
echo "Listo: $dir"
