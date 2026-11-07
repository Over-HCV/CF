#!/usr/bin/env bash
# Uso: scripts/san.sh A.cpp [entrada.txt]
# Compila con clang++ + AddressSanitizer + UndefinedBehaviorSanitizer.
# (GCC de Homebrew en Apple Silicon no trae sanitizers; por eso clang aquí.)
set -euo pipefail

src="${1:?uso: san.sh archivo.cpp [entrada.txt]}"
root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$root/build"
bin="$root/build/$(basename "${src%.cpp}")_san"

clang++ -std=c++23 -O1 -g \
  -DLOCAL -I "$root/include" \
  -fsanitize=address,undefined -fno-omit-frame-pointer -fno-sanitize-recover=undefined \
  "$src" -o "$bin"

if [[ $# -ge 2 ]]; then
  "$bin" < "$2"
else
  "$bin"
fi
