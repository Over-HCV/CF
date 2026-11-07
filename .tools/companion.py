#!/usr/bin/env python3
"""Recibe problemas desde el navegador y crea <sección>/<ID>/.

La extensión de Chrome (Cmd+I) o Competitive Companion leen el problema que
tienes abierto y lo envían por HTTP a tu computador. Este script escucha ese
envío y crea, según la sección de Codeforces:
    main/69A/       problemset normal y concursos (/problemset, /contest)
    acmsguru/100/   archivo acmsguru
    gym/100001A/    gym
Dentro de cada carpeta:
    sol.cpp         plantilla + nombre, enlace y límites del problema
    1.in / 1.out    entrada y salida esperada del ejemplo 1
    ...
Si sol.cpp ya existe, no se toca (solo se actualizan los ejemplos).
Si viene de la extensión CF → VS Code, guarda también stmt.md e imágenes.
Después abre todo en VS Code (enunciado a la izquierda, sol.cpp a la derecha).

Modos:
    companion.py           espera UN problema y termina   (comando n)
    companion.py --watch   escucha siempre                (lo usa la extensión CF de VS Code)
"""
from __future__ import annotations  # compatible con el python3 que trae macOS

import base64
import json
import os
import re
import shutil
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

PORT = int(os.environ.get("CF_PORT", 10045))  # 10045: uno de los puertos que Competitive Companion ya trae
ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / ".tools" / "template.cpp"


def id_from_url(url: str) -> str | None:
    """URL del problema → ruta relativa a la raíz, p. ej. 'main/69A'."""
    # /problemsets/acmsguru/problem/99999/100 → acmsguru/100
    m = re.search(r"/problemsets/acmsguru/problem/\d+/(\d+)", url)
    if m:
        return f"acmsguru/{m.group(1)}"
    # /gym/100001/problem/A → gym/100001A
    m = re.search(r"/gym/(\d+)/problem/([A-Z]\d*)", url)
    if m:
        return f"gym/{m.group(1)}{m.group(2)}"
    # /problemset/problem/69/A, /contest/69/problem/A → main/69A
    m = re.search(r"/(?:problemset/problem|contest)/(\d+)/(?:problem/)?([A-Z]\d*)", url)
    if m:
        return f"main/{m.group(1)}{m.group(2)}"
    return None


def problem_id(data: dict) -> str:
    pid = id_from_url(data.get("url", ""))
    if pid:
        return pid
    slug = re.sub(r"[^A-Za-z0-9]+", "-", data.get("name", "")).strip("-")
    return f"otros/{slug or 'problema'}"


def open_in_vscode(d: Path, fresh: bool) -> None:
    """Abre el problema en VS Code.

    - Con la extensión CF de VS Code (CF_EXT=1): le avisa por stdout y ella
      abre el enunciado a la izquierda y sol.cpp a la derecha.
      "new" = sol.cpp recién creado (la extensión lo convierte en snippet).
    - Sin ella (comando n): usa el comando `code` para abrir los archivos.
    """
    if os.environ.get("CF_NO_OPEN"):
        return
    if os.environ.get("CF_EXT"):
        print(f"CF_OPEN {'new' if fresh else 'old'} {d}", flush=True)
        return
    code = shutil.which("code")
    if not code:
        return
    sol = d / "sol.cpp"
    line = 1
    for i, text in enumerate(sol.read_text().splitlines(), 1):
        if text.strip() == "// ...":
            line = i
            break
    files = [str(d / "stmt.md")] if (d / "stmt.md").exists() else []
    subprocess.run([code, *files, "--goto", f"{sol}:{line}:5"], check=False)


def save_statement(d: Path, data: dict) -> None:
    """Guarda stmt.md y sus imágenes (solo llega desde la extensión CF → VS Code)."""
    md = data.get("statement")
    if not md:
        return
    for img in data.get("images", []):
        name = Path(img.get("name", "")).name  # sin rutas raras
        if not name:
            continue
        if img.get("data"):
            (d / name).write_bytes(base64.b64decode(img["data"]))
        elif img.get("url"):
            md = md.replace(f"]({name})", f"]({img['url']})")  # no se pudo bajar: enlace remoto
    (d / "stmt.md").write_text(md)


def create(data: dict) -> str:
    pid = problem_id(data)  # p. ej. "main/69A"
    d = ROOT / pid
    d.mkdir(parents=True, exist_ok=True)

    for old in list(d.glob("*.in")) + list(d.glob("*.out")):
        old.unlink()
    for i, t in enumerate(data.get("tests", []), 1):
        (d / f"{i}.in").write_text(t["input"])
        (d / f"{i}.out").write_text(t["output"])

    sol = d / "sol.cpp"
    fresh = not sol.exists()
    if fresh:
        header = (
            f"// {data.get('name', '')}\n"
            f"// {data.get('url', '')}\n"
            f"// Tiempo: {data.get('timeLimit', '?')} ms | Memoria: {data.get('memoryLimit', '?')} MB\n\n"
        )
        sol.write_text(header + TEMPLATE.read_text())

    save_statement(d, data)

    print(f"\n✔ {data.get('name', '')}  →  {pid}/sol.cpp")
    print(f"  {len(data.get('tests', []))} ejemplo(s) guardados" + (" + enunciado" if data.get("statement") else ""))
    if data.get("interactive"):
        print("  ⚠ Problema interactivo: los ejemplos locales no sirven para probarlo.")
    print(f"  Prueba con:  r {pid}", flush=True)

    open_in_vscode(d, fresh)
    return pid


class Handler(BaseHTTPRequestHandler):
    received = 0
    expected = 1
    wanted = None  # ID que el usuario dijo esperar (opcional)

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        self.send_response(200)
        self.end_headers()
        try:
            data = json.loads(body)
            Handler.expected = data.get("batch", {}).get("size", 1)
            Handler.received += 1
            pid = create(data)
        except Exception as e:  # un problema raro no debe tumbar el modo --watch
            print(f"✘ No pude guardar el problema: {e}", flush=True)
            return
        if Handler.wanted and Handler.wanted not in (pid, pid.split("/")[-1]):
            print(f"  ⚠ Esperabas {Handler.wanted} pero llegó {pid}. ¿Hiciste clic en otra pestaña?")

    def log_message(self, *args):  # silencia el log por defecto
        pass


def main():
    args = sys.argv[1:]
    watch = "--watch" in args
    args = [a for a in args if a != "--watch"]
    if args:
        Handler.wanted = id_from_url(args[0]) if "://" in args[0] else args[0].rstrip("/")

    try:
        server = HTTPServer(("127.0.0.1", PORT), Handler)
    except OSError:
        if watch:
            sys.exit(f"El puerto {PORT} ya está en uso; no arranco otra escucha.")
        sys.exit(
            "Ya hay una escucha activa (la extensión CF de VS Code).\n"
            "No necesitas n: en la página del problema presiona Cmd+I."
        )

    if watch:
        print("Escuchando: en la página del problema presiona Cmd+I.", flush=True)
    else:
        print("Esperando… En la página DEL PROBLEMA presiona Cmd+I (o Cmd+Shift+U con Competitive Companion).")
        print("(Ctrl+C para cancelar)", flush=True)
    try:
        while watch or Handler.received < Handler.expected:
            server.handle_request()
    except KeyboardInterrupt:
        print("\nCancelado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
