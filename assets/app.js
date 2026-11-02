(function () {
  "use strict";

  // This tool's own slug, used to (a) skip self-links when another tool's
  // glossary term points back here and (b) build this tool's own deep links
  // when it's the one being pointed at. Every tool in the atlas sets this to
  // its own repo name.
  const TOOL_SLUG = "lmwh-nste-acs-protocol";

  /* The source figure's flow: one invasive-vs-non-invasive decision splits
     the path into UFH (a true terminal — the figure draws no arrow out of
     it) and fondaparinux/LMWH. The LMWH branch fans out to three agent
     choices (enox_first/dalt_alt/nadro_alt — group "choice", 3-wide), which
     all re-converge on a single renal-function check, which itself fans out
     to three renal-tier boxes (group "renal", 3-wide) that all converge
     again on the closing "All patients" box. ufh_preferred/fonda_preferred
     share one 2-wide row (group "branch") the same way every other tool in
     the atlas draws a YES/NO pair — the fan-out/fan-in on both sides of the
     agent choice needs no special handling beyond that: each edge below is
     computed independently by drawEdges(), so multiple curves converging on
     one target just work. */
  const LAYOUT = {
    trigger:          { col: "full", row: 1 },
    angio_24h:        { col: "full", row: 2, decision: true },

    ufh_preferred:    { col: null, row: 3, group: "branch" },
    fonda_preferred:  { col: null, row: 3, group: "branch" },

    lmwh_priority:    { col: "full", row: 4 },

    enox_first:       { col: null, row: 5, group: "choice" },
    dalt_alt:         { col: null, row: 5, group: "choice" },
    nadro_alt:        { col: null, row: 5, group: "choice" },

    renal_check:      { col: "full", row: 6 },

    crcl_mid:         { col: null, row: 7, group: "renal" },
    crcl_low:         { col: null, row: 7, group: "renal" },
    special_pop:      { col: null, row: 7, group: "renal" },

    all_patients:     { col: "full", row: 8 }
  };

  // How many columns each named group's wrapper subdivides into — picks
  // the matching CSS class (flow-wrap-2 / flow-wrap-3) in render() below.
  const GROUP_COLUMNS = { branch: 2, choice: 3, renal: 3 };

  const EDGES = [
    ["trigger", "angio_24h"],
    ["angio_24h", "ufh_preferred", "YES"],
    ["angio_24h", "fonda_preferred", "NO"],
    // ufh_preferred is deliberately a dead end here — the source figure
    // draws no arrow out of the "Yes" branch (confirmed against a
    // high-resolution crop of the junction), so no edge originates from it.
    ["fonda_preferred", "lmwh_priority"],
    ["lmwh_priority", "enox_first"],
    ["lmwh_priority", "dalt_alt"],
    ["lmwh_priority", "nadro_alt"],
    ["enox_first", "renal_check"],
    ["dalt_alt", "renal_check"],
    ["nadro_alt", "renal_check"],
    ["renal_check", "crcl_mid"],
    ["renal_check", "crcl_low"],
    ["renal_check", "special_pop"],
    ["crcl_mid", "all_patients"],
    ["crcl_low", "all_patients"],
    ["special_pop", "all_patients"]
  ];

  const byId = {};
  NODES.forEach((n) => (byId[n.id] = n));

  /* ---- plain-text safety + glossary auto-linking ---- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // longest match first, so a longer term wins over any shorter overlapping one
  const GLOSSARY_SORTED = GLOSSARY.slice().sort((a, b) => b.match.length - a.match.length);

  /* ---- agent (drug) name emphasis ----
     Rendering-only: wraps every case-insensitive, whole-word occurrence of
     a name in AGENTS (content.js) in a plain <strong class="agent-name">
     span — never a link/button, since this also runs inside the diagram
     .node <button>, where a nested interactive element would be invalid
     HTML. Unlike glossary terms, every occurrence is wrapped, not just the
     first, and label/sub text itself is never altered — only how it's
     rendered. */
  const AGENTS_SORTED = (typeof AGENTS !== "undefined" ? AGENTS : [])
    .slice()
    .sort((a, b) => b.length - a.length);

  function highlightAgentsHtml(rawText) {
    const text = escapeHtml(rawText);
    let result = "";
    let cursor = 0;
    while (cursor < text.length) {
      let best = null;
      for (const name of AGENTS_SORTED) {
        const re = new RegExp("\\b" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
        const m = re.exec(text.slice(cursor));
        if (
          m &&
          (!best || m.index < best.index || (m.index === best.index && m[0].length > best.text.length))
        ) {
          best = { index: m.index, text: m[0] };
        }
      }
      if (!best) break;
      const matchStart = cursor + best.index;
      const matchEnd = matchStart + best.text.length;
      result += text.slice(cursor, matchStart);
      result += '<strong class="agent-name">' + best.text + "</strong>";
      cursor = matchEnd;
    }
    result += text.slice(cursor);
    return result;
  }

  /* ---- cross-atlas concept links ----
     A term that's independently glossary-defined in 2+ tools (checked and
     curated by hand when the index was built — same string, same clinical
     meaning, not just a coincidental match) gets a "Also covered in" line
     added under its definition, deep-linking straight to the other tool's
     node via its #node-<id> hash. Fetched once, best-effort: the page works
     identically if this never loads (slow network, offline, concepts.json
     unreachable) — it only adds a line that otherwise doesn't appear. */
  let CONCEPTS = null;
  let currentNodeId = null; // re-rendered once CONCEPTS loads, if a node is already open
  fetch("https://satbuhan.github.io/clinical-algorithm-atlas/assets/concepts.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      CONCEPTS = (data && data.terms) || {};
      if (currentNodeId) selectNode(currentNodeId);
    })
    .catch(() => {
      CONCEPTS = {};
    });

  // Other tools' occurrences of this same term, as an "Also covered in"
  // list — empty string if the index hasn't loaded yet, carries nothing to
  // show, or every occurrence is this tool itself.
  function crossLinksHtml(matchText) {
    if (!CONCEPTS) return "";
    const entries = CONCEPTS[matchText.toLowerCase().trim()];
    if (!entries) return "";
    const others = entries.filter((o) => o.tool !== TOOL_SLUG);
    if (!others.length) return "";
    const links = others
      .map((o) => {
        const href = o.nodeId ? o.url + "#node-" + o.nodeId : o.url;
        return '<a href="' + href + '">' + escapeHtml(o.title) + " →</a>";
      })
      .join(", ");
    return '<p class="term-crosslinks">Also covered in: ' + links + "</p>";
  }

  function linkify(rawText, usedTerms) {
    const text = escapeHtml(rawText);
    let result = "";
    let cursor = 0;
    // find the earliest, longest unused glossary match from `cursor` onward
    while (cursor < text.length) {
      let best = null;
      for (const g of GLOSSARY_SORTED) {
        if (usedTerms.has(g.match)) continue;
        const re = new RegExp("\\b" + g.match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
        const m = re.exec(text.slice(cursor));
        if (
          m &&
          (!best || m.index < best.index || (m.index === best.index && m[0].length > best.text.length))
        ) {
          best = { index: m.index, text: m[0], kind: "term", g };
        }
      }
      for (const name of AGENTS_SORTED) {
        const re = new RegExp("\\b" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
        const m = re.exec(text.slice(cursor));
        if (
          m &&
          (!best || m.index < best.index || (m.index === best.index && m[0].length > best.text.length))
        ) {
          best = { index: m.index, text: m[0], kind: "agent" };
        }
      }
      if (!best) break;
      const matchStart = cursor + best.index;
      const matchEnd = matchStart + best.text.length;
      result += text.slice(cursor, matchStart);
      if (best.kind === "agent") {
        result += '<strong class="agent-name">' + best.text + "</strong>";
      } else {
        const g = best.g;
        const label = g.full ? g.full[0].toUpperCase() + g.full.slice(1) : "";
        result +=
          '<button type="button" class="term" aria-expanded="false">' +
          best.text +
          "</button>" +
          '<span class="term-def" hidden>' +
          (g.full ? "<strong>" + escapeHtml(label) + "</strong> — " : "") +
          escapeHtml(g.def) +
          crossLinksHtml(g.match) +
          "</span>";
        usedTerms.add(g.match);
      }
      cursor = matchEnd;
    }
    result += text.slice(cursor);
    return result;
  }

  const flowEl = document.getElementById("flow");
  const edgesSvg = document.getElementById("edges");

  function nodeEl(n) {
    const layout = LAYOUT[n.id] || {};
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "node-" + n.id;
    btn.dataset.node = n.id;
    btn.setAttribute("aria-pressed", "false");

    let cls = "node";
    if (layout.decision) cls += " node--decision";
    if (n.type === "terminal") cls += " node--terminal";
    if (n.tone === "key") cls += " node--key";
    if (n.tone === "alarm") cls += " node--alarm";
    if (n.tone === "note") cls += " node--note";
    if (layout.col) cls += " " + layout.col;
    btn.className = cls;
    // Explicit row keeps every edge short and direct instead of relying
    // on implicit grid auto-placement. (Grouped nodes sit inside their
    // own flow-wrap-N subgrid, not the outer .flow grid, so the row goes
    // on the wrapper instead — see render().)
    if (layout.row && !layout.group) btn.style.gridRow = String(layout.row);

    const title = document.createElement("span");
    title.className = "node__title";
    title.innerHTML = highlightAgentsHtml(n.label);
    btn.appendChild(title);

    if (n.sub) {
      const sub = document.createElement("span");
      sub.className = "node__sub";
      sub.innerHTML = highlightAgentsHtml(n.sub);
      btn.appendChild(sub);
    }

    btn.addEventListener("click", () => selectNode(n.id));
    return btn;
  }

  function render() {
    // group ordinary nodes by document order, wrapping named groups in a
    // subgrid sized to that group's actual member count (2-way pairs,
    // the 3-way mid row, the 4-way low row).
    const seenGroups = {};
    NODES.forEach((n) => {
      const layout = LAYOUT[n.id] || {};
      if (layout.group) {
        let wrap = seenGroups[layout.group];
        if (!wrap) {
          wrap = document.createElement("div");
          const cols = GROUP_COLUMNS[layout.group] || 2;
          wrap.className = "flow-wrap-" + cols;
          // The wrapper itself sits in the outer .flow grid — its row
          // comes from the first grouped node's own `row`, since the
          // nodes inside share one wrapper position.
          if (layout.row) wrap.style.gridRow = String(layout.row);
          flowEl.appendChild(wrap);
          seenGroups[layout.group] = wrap;
        }
        wrap.appendChild(nodeEl(n));
      } else {
        flowEl.appendChild(nodeEl(n));
      }
    });
  }

  function clearActive() {
    document.querySelectorAll(".node.is-active").forEach((el) => {
      el.classList.remove("is-active");
      el.setAttribute("aria-pressed", "false");
    });
  }

  const readout = document.getElementById("readout");
  const readoutIdle = document.getElementById("readoutIdle");
  const readoutContent = document.getElementById("readoutContent");
  const readoutClose = document.getElementById("readoutClose");
  const backdrop = document.getElementById("backdrop");

  function kindTag(ids) {
    return ids
      .map((id) => '<a class="refchip" href="#ref-' + id + '">[' + id + "]</a>")
      .join("");
  }

  function renderDose(rows, usedTerms) {
    if (!rows) return "";
    const trs = rows
      .map(
        (r) =>
          "<tr><td>" +
          linkify(r[0], usedTerms) +
          "</td><td>" +
          linkify(r[1], usedTerms) +
          "</td></tr>"
      )
      .join("");
    return '<table class="dose-table"><tbody>' + trs + "</tbody></table>";
  }

  function selectNode(id) {
    const n = byId[id];
    if (!n) return;
    currentNodeId = id;
    clearActive();
    const el = document.getElementById("node-" + id);
    if (el) {
      el.classList.add("is-active");
      el.setAttribute("aria-pressed", "true");
    }

    readoutIdle.hidden = true;
    readoutContent.hidden = false;

    const usedTerms = new Set();

    let html = "";
    html += '<p class="readout__tag">' + escapeHtml(n.type) + "</p>";
    html += '<h2 class="readout__title">' + highlightAgentsHtml(n.label) + "</h2>";
    if (n.sub) html += '<p class="readout__sub">' + highlightAgentsHtml(n.sub) + "</p>";
    if (n.needsAuthor) {
      html +=
        '<span class="readout__flag">awaiting author citation</span>';
    }
    html += "<h3>What this means</h3><p>" + linkify(n.meaning, usedTerms) + "</p>";
    if (n.dose) {
      html += "<h3>Dosing, as authored</h3>" + renderDose(n.dose, usedTerms);
    }
    html += "<h3>Why</h3><p>" + linkify(n.rationale, usedTerms) + "</p>";
    if (n.cautions && n.cautions.length) {
      html +=
        "<h3>Cautions &amp; special populations</h3><ul class=\"caution-list\">" +
        n.cautions.map((c) => "<li>" + linkify(c, usedTerms) + "</li>").join("") +
        "</ul>";
    }
    html += "<h3>References</h3><div class=\"refchips\">" + kindTag(n.refs) + "</div>";

    readoutContent.innerHTML = html;

    if (window.matchMedia("(max-width: 900px)").matches) {
      readout.classList.add("is-open");
      backdrop.classList.add("is-open");
    }
  }

  function closeReadout() {
    readout.classList.remove("is-open");
    backdrop.classList.remove("is-open");
  }

  readoutContent.addEventListener("click", (e) => {
    const btn = e.target.closest(".term");
    if (!btn) return;
    const def = btn.nextElementSibling;
    if (!def || !def.classList.contains("term-def")) return;
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", open ? "false" : "true");
    def.hidden = open;
  });

  readoutClose.addEventListener("click", closeReadout);
  backdrop.addEventListener("click", closeReadout);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeReadout();
  });

  /* ---- references list ---- */
  function renderReferences() {
    const list = document.getElementById("referencesList");
    const count = document.getElementById("refCount");
    if (count) count.textContent = "(" + REFERENCES.length + ")";
    REFERENCES.forEach((r) => {
      const li = document.createElement("li");
      li.id = "ref-" + r.id;
      const linkHtml = r.url
        ? "<br><a href=\"" +
          r.url +
          '" target="_blank" rel="noopener">' +
          r.url +
          "</a>"
        : "";
      li.innerHTML =
        r.text + ' <span class="kind">' + r.kind + "</span>" + linkHtml;
      list.appendChild(li);
    });
  }

  /* ---- connector lines (desktop only) ---- */
  function pointAt(el, side) {
    const flowRect = flowEl.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = {
      left: r.left,
      right: r.right,
      center: (r.left + r.right) / 2
    };
    const y = {
      top: r.top,
      bottom: r.bottom,
      center: (r.top + r.bottom) / 2
    };
    return {
      x: x[side.x] - flowRect.left,
      y: y[side.y] - flowRect.top
    };
  }

  function drawEdges() {
    // Drawn on every viewport — mobile shows the identical diagram
    // inside a horizontally scrollable .scope, rather than a reflowed
    // linear stack, so the arrows are needed there too.
    const flowRect = flowEl.getBoundingClientRect();
    edgesSvg.setAttribute("width", flowRect.width);
    edgesSvg.setAttribute("height", flowRect.height);
    edgesSvg.setAttribute("viewBox", "0 0 " + flowRect.width + " " + flowRect.height);
    edgesSvg.innerHTML =
      '<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="6.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#4A6684"/></marker></defs>';

    EDGES.forEach(([fromId, toId, label, variant]) => {
      const a = document.getElementById("node-" + fromId);
      const b = document.getElementById("node-" + toId);
      if (!a || !b) return;
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();

      // Compare vertical CENTERS, not tops: a decision diamond uses
      // align-self:center (it doesn't stretch to the row's full height),
      // while an ordinary box with multi-line sub text can be taller than
      // the row's other cells and define the row height itself — so two
      // nodes genuinely on the same grid row can still have different
      // `top`s even though they're vertically centered on each other.
      const aCenterY = (ar.top + ar.bottom) / 2;
      const bCenterY = (br.top + br.bottom) / 2;

      let p1, p2;
      if (Math.abs(aCenterY - bCenterY) < 8) {
        // same row: connect sides
        p1 = pointAt(a, { x: ar.left < br.left ? "right" : "left", y: "center" });
        p2 = pointAt(b, { x: ar.left < br.left ? "left" : "right", y: "center" });
      } else {
        p1 = pointAt(a, { x: "center", y: "bottom" });
        p2 = pointAt(b, { x: "center", y: "top" });
      }

      const midY = (p1.y + p2.y) / 2;
      let d =
        Math.abs(p1.y - p2.y) < 4
          ? "M" + p1.x + "," + p1.y + " L" + p2.x + "," + p2.y
          : "M" + p1.x + "," + p1.y +
            " C" + p1.x + "," + midY + " " + p2.x + "," + midY + " " + p2.x + "," + p2.y;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "flow-edge" + (variant === "info" ? " is-info" : ""));
      if (variant !== "info") path.setAttribute("marker-end", "url(#arrow)");
      edgesSvg.appendChild(path);

      if (label) {
        const sameRow = Math.abs(p1.y - p2.y) < 4;
        const lx = sameRow ? (p1.x + p2.x) / 2 : p2.x + (p1.x > p2.x ? -10 : 10);
        const ly = sameRow ? p1.y - 8 : p1.y + (p2.y - p1.y) * 0.22;

        // Label background scales with text length.
        const labelW = Math.max(28, label.length * 6.1 + 12);

        const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bg.setAttribute("class", "edge-label-bg");
        bg.setAttribute("x", lx - labelW / 2);
        bg.setAttribute("y", ly - 11);
        bg.setAttribute("width", labelW);
        bg.setAttribute("height", 14);
        edgesSvg.appendChild(bg);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("class", "edge-label");
        text.setAttribute("x", lx);
        text.setAttribute("y", ly);
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        edgesSvg.appendChild(text);
      }
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawEdges, 120);
  });

  render();
  renderReferences();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(drawEdges);
  }
  window.addEventListener("load", drawEdges);
  drawEdges();

  // Deep link support: "#node-<id>" (matching each node button's own DOM
  // id) opens that node's readout and scrolls it into view on arrival —
  // what the cross-atlas "Also covered in" links above point at, so a
  // click lands on the right box instead of just the other tool's
  // homepage. Harmless on a plain, hash-free visit.
  const linkedNodeId = window.location.hash.replace(/^#node-/, "");
  if (linkedNodeId && byId[linkedNodeId]) {
    selectNode(linkedNodeId);
    window.addEventListener("load", () => {
      const el = document.getElementById("node-" + linkedNodeId);
      if (el) el.scrollIntoView({ block: "center", inline: "center" });
    });
  }
})();
