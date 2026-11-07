#!/usr/bin/env bash
# Uso: scripts/run.sh A.cpp [entrada.txt]
# Compila con g++-15 en modo depuración (como el juez + chequeos extra) y ejecuta.
set -euo pipefail

src="${1:?uso: run.sh archivo.cpp [entrada.txt]}"
root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$root/build"
bin="$root/build/$(basename "${src%.cpp}")"

/opt/homebrew/bin/g++-15 -std=c++23 -O2 \
  -Wall -Wextra -Wshadow -Wconversion \
  -DLOCAL -D_GLIBCXX_DEBUG -D_GLIBCXX_DEBUG_PEDANTIC \
  -Wl,-stack_size,0x10000000 \
  "$src" -o "$bin"

if [[ $# -ge 2 ]]; then
  "$bin" < "$2"
else
  "$bin"
fi
