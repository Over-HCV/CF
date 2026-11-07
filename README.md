# Codeforces — chuleta

## Flujo normal (VS Code + CPH)
1. Abre esta carpeta (`CF/`) en VS Code.
2. En Codeforces, abre el problema y haz clic en el ícono de **Competitive Companion**.
3. CPH crea `2050A.cpp` con la plantilla y los ejemplos.
4. `Ctrl+Alt+B` corre todos los ejemplos (verde = pasa, rojo = falla).
5. Envía con **GNU G++23 14.2 (64 bit, msys2)**.

## Terminal
```sh
scripts/run.sh A.cpp in.txt     # g++-15 + _GLIBCXX_DEBUG (uso diario)
scripts/san.sh A.cpp in.txt     # clang++ + ASan/UBSan (crash raro, overflow)
scripts/new.sh 2050             # contests/2050/{A..F}.cpp desde la plantilla
```

## Recordatorios
- Usa siempre `g++-15`. En Mac, `g++` es Clang y no trae `bits/stdc++.h`.
- Imprime con `'\n'`, no con `endl`.
- `dbg(x)` solo imprime en local (`-DLOCAL`); en el juez desaparece.
- Usa `long long` si la respuesta puede pasar de ~2·10⁹.
