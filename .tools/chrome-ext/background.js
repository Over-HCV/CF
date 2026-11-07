// Al presionar Cmd+Shift+U (o clic en el ícono):
// 1) lee el problema de la pestaña abierta (content.js),
// 2) descarga sus imágenes (con la sesión de tu navegador),
// 3) lo envía a http://127.0.0.1:10045, donde escucha el proyecto CF.

function badge(tabId, text, color) {
  chrome.action.setBadgeBackgroundColor({ tabId, color });
  chrome.action.setBadgeText({ tabId, text });
  setTimeout(() => chrome.action.setBadgeText({ tabId, text: "" }), 3000);
}

async function toBase64(url) {
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const bytes = new Uint8Array(await r.arrayBuffer());
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    if (!result || result.error) throw new Error(result?.error || "sin datos");

    for (const img of result.images) {
      try {
        img.data = await toBase64(img.url);
      } catch (e) {
        console.warn("No pude descargar", img.url, e); // se usará el enlace remoto
      }
    }

    const r = await fetch("http://127.0.0.1:10045/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (!r.ok) throw new Error(`VS Code respondió ${r.status}`);
    badge(tab.id, "OK", "#2e7d32");
  } catch (e) {
    console.error(e);
    badge(tab.id, "ERR", "#c62828");
  }
});
