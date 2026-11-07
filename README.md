# Codeforces — chuleta

## Resolver un problema
1. En el navegador, en la página del problema (no en /submit), presiona **Cmd+I**.
2. VS Code abre solo:
   - a la izquierda, el enunciado renderizado (`stmt.md`, con fórmulas e imágenes);
   - a la derecha, `sol.cpp` con la plantilla. Si es nuevo, `cin >> t;` queda seleccionado:
     **Borrar** si el problema tiene un solo caso, **Tab** si tiene varios.
     El cursor salta a `solve()`.

   Los ejemplos quedan en `main/69A/1.in`, `1.out`, …
3. Escribe tu solución.
4. Prueba:
   ```sh
   r main/69A
   ```
   Muestra ✔ o ✘ por ejemplo; en ✘ te enseña entrada, esperado, tu salida y tu `dbg`.
5. Envía `sol.cpp` en Codeforces con **GNU G++23 14.2 (64 bit, msys2)**.

## Comandos
| Atajo | Nombre largo | Qué hace |
|---|---|---|
| `n` | `new` | Solo si la extensión CF de VS Code no está escuchando: espera un problema y termina |
| `r main/69A` | `run` | Compila y prueba todos los ejemplos (también `r 69A`, o `r` dentro de la carpeta) |
| `s main/69A` | `san` | Igual, pero con sanitizers (crash raro, overflow) |
| `r x.cpp in.txt` | | Ejecuta con una entrada tuya |

Los atajos solo existen en la terminal de VS Code de este proyecto
(`.vscode/settings.json` + una línea al final de `~/.zshrc`).

## Cómo funciona Cmd+I
- `.tools/chrome-ext/`: extensión de Chrome. Lee la página que tienes abierta
  (enunciado, fórmulas, imágenes, ejemplos) y la envía a `127.0.0.1:10045`.
- `.tools/vscode-ext/`: extensión de VS Code (instalada como `local.cf-helper`).
  Al abrir el proyecto arranca `.tools/companion.py --watch`, que guarda los archivos,
  y luego acomoda el enunciado y `sol.cpp` lado a lado.
  En la barra de abajo verás **CF**; clic ahí si necesitas reiniciar la escucha.

## Protección de concursos en vivo (hook de git)
`.tools/hooks/pre-push` revisa antes de cada `git push` si subes algo de `main/<concurso>…/`
y pregunta a la API de Codeforces si ese concurso ya terminó. Si no, cancela el push;
tus commits quedan guardados y los subes cuando termine.
- Al clonar el repositorio en otro computador, actívalo una vez con
  `git config core.hooksPath .tools/hooks`.
- Para saltarlo en un caso excepcional: `git push --no-verify`.

## Carpetas
- `main/`     problemas del problemset y concursos (`main/69A`, `main/4A`…)
- `acmsguru/` problemas del archivo acmsguru (`acmsguru/100`…), se crea sola si haces uno
- `gym/`      problemas de gym (`gym/100001A`…), se crea sola si haces uno
- `.tools/`   piezas internas; ahí está `template.cpp`, la plantilla de cada problema nuevo
  (el snippet `cp` está en `.vscode/cp.code-snippets`: si cambias uno, cambia el otro)
- `build/`    programas compilados (se puede borrar)

## Recordatorios
- Si el problema tiene un solo caso, comenta `cin >> t;` en la plantilla.
- Imprime con `'\n'`, no con `endl`.
- `dbg(x)` solo imprime en tu Mac; en el juez desaparece.
- Usa `long long` si un número puede pasar de ~2·10⁹.
- Pasar los ejemplos no garantiza Accepted: el juez usa más casos, que son secretos.
