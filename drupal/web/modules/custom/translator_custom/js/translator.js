document.addEventListener("DOMContentLoaded", () => {

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

  // 🌐 Dropdown
  const dropdown = document.createElement("select");
  dropdown.id = "lang";

  dropdown.style.position = "fixed";
  dropdown.style.top = "15px";
  dropdown.style.right = "20px";
  dropdown.style.zIndex = "99999";
  dropdown.style.padding = "8px";

  dropdown.innerHTML = `
    <option value="">🌐 Select Language</option>
    ${Object.keys(LANG_MAP).map(l => `<option value="${l}">${l}</option>`).join("")}
  `;

  document.body.appendChild(dropdown);

  // 🚫 Get FULL PAGE text nodes (fresh scan every time)
  function getTextNodes() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {

          const text = node.nodeValue.trim();
          if (!text) return NodeFilter.FILTER_REJECT;

          const parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tag = parent.tagName;

          // ❌ Skip UI elements
          if (
            ["SCRIPT","STYLE","NOSCRIPT","SELECT","OPTION","INPUT","TEXTAREA","BUTTON"].includes(tag)
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          // ❌ Skip dropdown itself
          if (parent.closest("#lang")) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      nodes.push(node);
    }
    return nodes;
  }

  // 🚀 FULL PAGE TRANSLATION ON CHANGE
  dropdown.addEventListener("change", async (e) => {

    const lang = e.target.value;
    if (!lang) return;

    // 🔥 IMPORTANT: fresh scan every click (FULL PAGE FIX)
    let textNodes = getTextNodes();
    let texts = textNodes.map(n => n.nodeValue);

    try {
      const res = await fetch("/api/translator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts,
          lang
        })
      });

      const data = await res.json();

      if (data.translations) {
        textNodes.forEach((node, i) => {
          if (data.translations[i]) {
            node.nodeValue = data.translations[i];
          }
        });
      }

    } catch (err) {
      console.error("Translation Error:", err);
    }

  });

});
