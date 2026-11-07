// Extensión local del proyecto CF.
// - Al abrir el proyecto, arranca .tools/companion.py --watch (escucha en el puerto 10045).
// - Cuando llega un problema:
//     1) trae esta ventana de VS Code al frente,
//     2) abre stmt.md renderizado a la izquierda y sol.cpp a la derecha,
//     3) si sol.cpp es nuevo, lo convierte en snippet:
//        `cin >> t;` queda seleccionado (Borrar o Tab) y Tab salta a solve().
const vscode = require("vscode");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");

let child = null;
let out = null;
let status = null;

function findRoot() {
  const f = (vscode.workspace.workspaceFolders || []).find((w) =>
    fs.existsSync(path.join(w.uri.fsPath, ".tools", "companion.py"))
  );
  return f && f.uri.fsPath;
}

// Trae al frente la ventana que tiene abierta la carpeta CF.
// Usa el comando `code <carpeta>` como si lo corrieras desde una terminal externa:
// si la carpeta ya está abierta, VS Code solo enfoca esa ventana.
function focusWindow(root) {
  return new Promise((resolve) => {
    const cli = path.join(vscode.env.appRoot, "bin", "code");
    if (!fs.existsSync(cli)) return resolve();
    const env = {};
    for (const [k, v] of Object.entries(process.env)) {
      if (!k.startsWith("VSCODE_") && k !== "ELECTRON_RUN_AS_NODE") env[k] = v;
    }
    cp.execFile(cli, [root], { env }, () => resolve());
  });
}

// Convierte el sol.cpp recién creado en un snippet:
//   ${1:cin >> t; ...}  en main()  → primera parada (Borrar para quitarlo, Tab para dejarlo)
//   $0 en "// ..."      en solve() → donde terminas escribiendo
function templateSnippet(text) {
  const s = new vscode.SnippetString();
  let found = 0;
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const indent = line.match(/^\s*/)[0];
    const body = line.trim();
    if (body === "// ..." && !(found & 1)) {
      s.appendText(indent);
      s.appendTabstop(0);
      found |= 1;
    } else if (body.startsWith("cin >> t;") && !(found & 2)) {
      s.appendText(indent);
      s.appendPlaceholder(body, 1);
      found |= 2;
    } else {
      s.appendText(line);
    }
    if (i < lines.length - 1) s.appendText("\n");
  });
  return found ? s : null;
}

async function openProblem(root, dir, fresh) {
  await focusWindow(root);

  const md = path.join(dir, "stmt.md");
  const sol = path.join(dir, "sol.cpp");
  const hasMd = fs.existsSync(md);

  if (hasMd) {
    try {
      await vscode.commands.executeCommand(
        "vscode.openWith",
        vscode.Uri.file(md),
        "vscode.markdown.preview.editor",
        { viewColumn: vscode.ViewColumn.One, preview: false }
      );
    } catch (e) {
      out.appendLine(`No pude abrir la vista previa: ${e}`);
    }
  }

  const doc = await vscode.workspace.openTextDocument(sol);
  const editor = await vscode.window.showTextDocument(doc, {
    viewColumn: hasMd ? vscode.ViewColumn.Two : vscode.ViewColumn.Active,
    preview: false,
    preserveFocus: false,
  });

  const snippet = fresh ? templateSnippet(doc.getText()) : null;
  if (snippet) {
    const all = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
    await editor.insertSnippet(snippet, all);
  } else {
    let line = doc.getText().split("\n").findIndex((l) => l.trim() === "// ...");
    if (line < 0) line = 0;
    const pos = new vscode.Position(line, 4);
    editor.selection = new vscode.Selection(pos, pos);
    editor.revealRange(new vscode.Range(pos, pos));
  }
}

function start(root) {
  stop();
  const python = fs.existsSync("/opt/homebrew/bin/python3") ? "/opt/homebrew/bin/python3" : "python3";
  child = cp.spawn(python, [path.join(root, ".tools", "companion.py"), "--watch"], {
    cwd: root,
    env: { ...process.env, CF_EXT: "1" },
  });
  status.text = "$(radio-tower) CF";
  status.tooltip = "Escuchando problemas (Cmd+I en el navegador)";

  let buf = "";
  child.stdout.on("data", (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      const m = line.match(/^CF_OPEN (new|old) (.+)$/);
      if (m) {
        openProblem(root, m[2].trim(), m[1] === "new").catch((e) => out.appendLine(String(e)));
      } else {
        out.appendLine(line);
      }
    }
  });
  child.stderr.on("data", (d) => out.append(String(d)));
  child.on("exit", (code) => {
    out.appendLine(`(escucha terminada, código ${code})`);
    status.text = "$(circle-slash) CF";
    status.tooltip = "La escucha no está activa. Clic para reiniciar.";
    child = null;
  });
}

function stop() {
  if (child) {
    child.kill();
    child = null;
  }
}

function activate(context) {
  const root = findRoot();
  if (!root) return;

  out = vscode.window.createOutputChannel("CF");
  status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  status.command = "cf.restart";
  status.show();

  context.subscriptions.push(
    out,
    status,
    vscode.commands.registerCommand("cf.restart", () => start(root)),
    vscode.commands.registerCommand("cf.showLog", () => out.show()),
    { dispose: stop }
  );
  start(root);
}

function deactivate() {
  stop();
}

module.exports = { activate, deactivate };
