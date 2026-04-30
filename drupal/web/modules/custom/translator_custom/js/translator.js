document.addEventListener("DOMContentLoaded", () => {

  // 🌐 22 Indian Languages (UI ONLY - DO NOT TRANSLATE THIS)
  const LANG_MAP = {
    Hindi: "Hindi",
    Marathi: "Marathi",
    Bengali: "Bengali",
    Tamil: "Tamil",
    Telugu: "Telugu",
    Gujarati: "Gujarati",
    Punjabi: "Punjabi",
    Kannada: "Kannada",
    Malayalam: "Malayalam",
    Odia: "Odia",
    Assamese: "Assamese",
    Urdu: "Urdu",
    Sanskrit: "Sanskrit",
    Konkani: "Konkani",
    Maithili: "Maithili",
    Dogri: "Dogri",
    Kashmiri: "Kashmiri",
    Sindhi: "Sindhi",
    Manipuri: "Manipuri",
    Bodo: "Bodo",
    Santali: "Santali",
    Nepali: "Nepali"
  };

  // ==============================
  // 🌐 CREATE DROPDOWN (FIXED UI)
  // ==============================
  const dropdown = document.createElement("select");
  dropdown.id = "lang";

  dropdown.style.position = "fixed";
  dropdown.style.top = "15px";
  dropdown.style.right = "20px";
  dropdown.style.zIndex = "999999";
  dropdown.style.padding = "10px";
  dropdown.style.borderRadius = "8px";
  dropdown.style.background = "#111";
  dropdown.style.color = "#fff";

  dropdown.innerHTML =
    `<option value="">🌐 Select Language</option>` +
    Object.keys(LANG_MAP)
      .map(lang => `<option value="${lang}">${lang}</option>`)
      .join("");

  document.body.appendChild(dropdown);

  // ==============================
  // 🔍 GET TEXT NODES (SAFE)
  // ==============================
  function getTextNodes() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {

          const text = node.nodeValue.trim();
          if (!text) return NodeFilter.FILTER_REJECT;

          const parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tag = parent.tagName;

          // ❌ ignore UI + scripts
          if (
            ["SCRIPT","STYLE","NOSCRIPT","SELECT","OPTION","INPUT","TEXTAREA","BUTTON"].includes(tag)
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          // ❌ NEVER translate dropdown
          if (parent.closest("#lang")) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let n;
    while (n = walker.nextNode()) {
      nodes.push(n);
    }
    return nodes;
  }

  // ==============================
  // 🚀 TRANSLATION HANDLER
  // ==============================
  dropdown.addEventListener("change", async (e) => {

    const lang = e.target.value;
    if (!lang) return;

    const textNodes = getTextNodes();
    const texts = textNodes.map(n => n.nodeValue);

    try {

      const res = await fetch("/api/translator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          texts: texts,
          lang: lang
        })
      });

      const data = await res.json();

      // ==============================
      // ⚡ SAFE APPLY (NO CRASH)
      // ==============================
      if (data && data.translations && Array.isArray(data.translations)) {

        textNodes.forEach((node, i) => {

          // fallback protection
          if (data.translations[i]) {
            node.nodeValue = data.translations[i];
          }

        });

      } else {
        console.error("Invalid translation response:", data);
        alert("Translation failed for selected language.");
      }

    } catch (err) {
      console.error("Translation Error:", err);
      alert("API error occurred.");
    }

  });

});
