// Se inyecta en la pestaña del problema y devuelve:
//   { name, url, timeLimit, memoryLimit, tests, statement (Markdown), images, ... }
// Mismo formato que Competitive Companion + "statement" e "images".
(async () => {
  // Preferimos el HTML original (las fórmulas siguen como $$$...$$$, sin MathJax).
  // Es la misma página que ya estás viendo, pedida por tu propio navegador.
  let root = null;
  try {
    const r = await fetch(location.href, { credentials: "include" });
    if (r.ok) {
      const d = new DOMParser().parseFromString(await r.text(), "text/html");
      root = d.querySelector(".problem-statement");
    }
  } catch (_) {}
  if (!root) root = document.querySelector(".problem-statement");
  if (!root) return { error: "No encontré el enunciado. ¿Estás en la página de un problema?" };

  // Marca las fórmulas antes de convertir:
  //   $$$$$$ x $$$$$$  → <cf-math display>   (ecuación centrada)
  //   $$$ x $$$        → <cf-math>           (ecuación en línea)
  const holder = document.createElement("div");
  holder.innerHTML = root.innerHTML
    .replace(/\$\$\$\$\$\$([\s\S]*?)\$\$\$\$\$\$/g, "<cf-math display>$1</cf-math>")
    .replace(/\$\$\$([\s\S]*?)\$\$\$/g, "<cf-math>$1</cf-math>");
  root = holder;

  const images = [];
  const esc = (s) => s.replace(/([\\`*_[\]])/g, "\\$1");
  const math = (t, display) => {
    t = t.trim();
    return display ? `\n\n$$\n${t}\n$$\n\n` : `$${t}$`;
  };

  function preText(pre) {
    const lines = pre.querySelectorAll(".test-example-line");
    let s;
    if (lines.length) {
      s = [...lines].map((l) => l.textContent).join("\n");
    } else {
      s = "";
      pre.childNodes.forEach((n) => (s += n.nodeName === "BR" ? "\n" : n.textContent));
    }
    return s.replace(/^\n+/, "").replace(/\s+$/, "") + "\n";
  }

  function conv(node) {
    if (node.nodeType === Node.TEXT_NODE) return esc(node.textContent.replace(/\s+/g, " "));
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const cls = node.classList;
    const inner = () => [...node.childNodes].map(conv).join("");
    const wrap = (l, r = l) => {
      const t = inner().trim();
      return t ? `${l}${t}${r}` : "";
    };

    if (tag === "cf-math") return math(node.textContent, node.hasAttribute("display"));
    if (tag === "script") {
      const type = node.getAttribute("type") || "";
      return type.startsWith("math/tex") ? math(node.textContent, type.includes("display")) : "";
    }
    if (tag === "style" || tag.startsWith("mjx") || [...cls].some((c) => /^(MathJax|MJX)/.test(c))) return "";
    if (cls.contains("section-title")) return `\n\n## ${node.textContent.trim()}\n\n`;
    if (cls.contains("tex-font-style-bf")) return wrap("**");
    if (cls.contains("tex-font-style-it") || cls.contains("tex-font-style-sl")) return wrap("*");
    if (cls.contains("tex-font-style-tt")) return "`" + node.textContent + "`";

    switch (tag) {
      case "p":
      case "center":
      case "div":
        return `\n\n${inner().trim()}\n\n`;
      case "br":
        return "\\\n";
      case "b":
      case "strong":
        return wrap("**");
      case "i":
      case "em":
        return wrap("*");
      case "code":
        return "`" + node.textContent + "`";
      case "pre":
        return "\n\n```\n" + preText(node) + "```\n\n";
      case "a":
        return `[${inner().trim()}](${new URL(node.getAttribute("href") || "", location.href).href})`;
      case "img": {
        const url = new URL(node.getAttribute("src") || "", location.href).href;
        const ext = (url.split("?")[0].match(/\.(png|jpe?g|gif|svg|webp)$/i) || [".png"])[0].toLowerCase();
        const name = `img${images.length + 1}${ext}`;
        images.push({ name, url });
        return `![](${name})`;
      }
      case "ul":
      case "ol":
        return (
          "\n\n" +
          [...node.children]
            .filter((li) => li.tagName === "LI")
            .map((li, i) => (tag === "ol" ? `${i + 1}. ` : "- ") + [...li.childNodes].map(conv).join("").trim())
            .join("\n") +
          "\n\n"
        );
      case "table": {
        const rows = [...node.querySelectorAll("tr")].map((tr) =>
          [...tr.children].map((td) => [...td.childNodes].map(conv).join("").trim().replace(/\n+/g, " ").replace(/\|/g, "\\|"))
        );
        if (!rows.length) return "";
        const head = rows[0];
        return (
          "\n\n| " + head.join(" | ") + " |\n|" + head.map(() => " --- |").join("") + "\n" +
          rows.slice(1).map((r) => "| " + r.join(" | ") + " |").join("\n") + "\n\n"
        );
      }
      default:
        return inner();
    }
  }

  // Limpia saltos de línea y espacios sobrantes (sin tocar los bloques de código)
  function tidy(md) {
    return md
      .split(/(```[\s\S]*?```)/)
      .map((part, i) =>
        i % 2 ? part : part.replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n")
      )
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n";
  }

  // --- Encabezado y límites
  const header = root.querySelector(".header");
  const title = header?.querySelector(".title")?.textContent.trim() || document.title;
  const limit = (sel) => {
    const el = header?.querySelector(sel);
    if (!el) return "";
    const c = el.cloneNode(true);
    c.querySelector(".property-title")?.remove();
    return c.textContent.trim();
  };
  const tl = limit(".time-limit");
  const ml = limit(".memory-limit");
  const sec = parseFloat((tl.match(/[\d.]+/) || ["0"])[0]);
  const mb = parseInt((ml.match(/\d+/) || ["0"])[0], 10);

  // --- Ejemplos
  const ins = [...root.querySelectorAll(".sample-test .input pre")].map(preText);
  const outs = [...root.querySelectorAll(".sample-test .output pre")].map(preText);
  const tests = ins.map((input, i) => ({ input, output: outs[i] ?? "" }));

  // --- Enunciado en Markdown
  let body = "";
  for (const child of root.children) {
    if (child.classList.contains("header")) continue;
    if (child.classList.contains("sample-tests")) {
      body += "\n\n## Ejemplos\n\n";
      tests.forEach((t, i) => {
        body += `**Entrada ${i + 1}**\n\n\`\`\`\n${t.input}\`\`\`\n\n**Salida ${i + 1}**\n\n\`\`\`\n${t.output}\`\`\`\n\n`;
      });
      continue;
    }
    body += conv(child);
  }
  const statement = tidy(
    `# ${esc(title)}\n\n` +
      `**Tiempo:** ${esc(tl)} · **Memoria:** ${esc(ml)} · [Ver en Codeforces](${location.href})\n\n` +
      body
  );

  return {
    name: title,
    group: "Codeforces",
    url: location.href,
    interactive: [...root.querySelectorAll(".section-title")].some((e) => /^Interaction/i.test(e.textContent.trim())),
    timeLimit: Math.round(sec * 1000),
    memoryLimit: mb,
    tests,
    testType: "single",
    input: { type: "stdin" },
    output: { type: "stdout" },
    batch: { id: crypto.randomUUID(), size: 1 },
    statement,
    images,
  };
})();
