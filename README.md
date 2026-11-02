# LMWH Selection & Renal Dosing in Unstable Angina / NSTEMI — Interactive Decision Algorithm

An interactive, referenced walkthrough of the decision-making algorithm for
choosing and dosing a parenteral anticoagulant — unfractionated heparin,
fondaparinux, or a low-molecular-weight heparin (enoxaparin, dalteparin or
nadroparin) — in non-ST-elevation acute coronary syndrome (NSTE-ACS): unstable
angina or NSTEMI. Every box and decision point in the diagram can be selected
to reveal, in one place: what the step means, why the algorithm calls for it,
the exact dosing as authored, and the sources behind it.

**Live site:** https://satbuhan.github.io/lmwh-nste-acs-protocol/

**Authors:** Dr. Özgür Karcıoğlu & Dr. Satuk Buğra Han Bozatlı

This tool is part of a growing atlas of tools built the same way:

- [Clinical Algorithm Atlas](https://satbuhan.github.io/clinical-algorithm-atlas/) — the hub page for all of them
- [Reperfusion therapy in acute pulmonary thromboembolism](https://github.com/satbuhan/pte-thrombolysis-protocol) ([live site](https://satbuhan.github.io/pte-thrombolysis-protocol/))
- [Acute aortic dissection — initial medical management](https://github.com/satbuhan/aortic-dissection-protocol) ([live site](https://satbuhan.github.io/aortic-dissection-protocol/))
- [Butyrophenone selection — acute agitation & hyperactive delirium](https://github.com/satbuhan/agitation-delirium-protocol) ([live site](https://satbuhan.github.io/agitation-delirium-protocol/))
- [Influenza antiviral selection — baloxavir marboxil vs oseltamivir](https://github.com/satbuhan/influenza-antiviral-protocol) ([live site](https://satbuhan.github.io/influenza-antiviral-protocol/))
- [Dexketoprofen vs ibuprofen — selecting an NSAID for acute pain](https://github.com/satbuhan/nsaid-pain-protocol) ([live site](https://satbuhan.github.io/nsaid-pain-protocol/))
- [Anticoagulant reversal in gastrointestinal haemorrhage](https://github.com/satbuhan/anticoagulant-reversal-protocol) ([live site](https://satbuhan.github.io/anticoagulant-reversal-protocol/))
- [The adult with obesity in emergency and critical care](https://github.com/satbuhan/obesity-critical-care-protocol) ([live site](https://satbuhan.github.io/obesity-critical-care-protocol/))
- [Dapagliflozin / SGLT2 inhibitor — overdose and acute illness management](https://github.com/satbuhan/dapagliflozin-overdose-protocol) ([live site](https://satbuhan.github.io/dapagliflozin-overdose-protocol/))
- [Lidocaine vs prilocaine — local anaesthesia for laceration repair](https://github.com/satbuhan/lidocaine-prilocaine-protocol) ([live site](https://satbuhan.github.io/lidocaine-prilocaine-protocol/))
- [Ketamine in head injury — safety & complication management](https://github.com/satbuhan/ketamine-head-injury-protocol) ([live site](https://satbuhan.github.io/ketamine-head-injury-protocol/))

## Why this exists

A flowchart alone tells a reader *what* to do at each step but not *why*,
and a reader outside the authors' own team cannot easily check the evidence
behind a specific number (a renal dose cut-off, an anti-Xa target, a bleeding
rate). This page keeps the original algorithm exactly as authored, and
attaches the clinical reasoning and literature to each box without
cluttering the diagram itself.

The algorithm this page presents is Figure 2 of a systematic review by the
same authors on LMWH selection in NSTE-ACS (manuscript in preparation, 104
references); the supplementary content on this page draws on that review's
evidence base, cross-checked against independent sourcing for every
citation.

## Status

This is a working version, built to be tested on both desktop and mobile.
Several things are worth flagging explicitly:

- **The "Unfractionated heparin preferred" box is a genuine dead end in the
  source figure.** Unlike every other box on this diagram, Figure 2 draws no
  arrow out of it — confirmed against a high-resolution crop of that exact
  junction. This tool preserves that: `ufh_preferred` has no outgoing edge in
  `assets/app.js`'s `EDGES`, rendering it with the same lighter "terminal"
  visual weight as the closing "All patients" box.
- **Reference 50 (Streiner & Norman)** had a DOI in the manuscript that did
  not resolve. Independent verification located the correct DOI
  (`10.1097/00005650-200305000-00004`) and confirmed the manuscript's use of
  the source — for the |d|≥0.50 "moderate effect" threshold, not the
  review's own |d|≥0.20 minimal-clinically-important-difference cut-off — is
  accurately scoped. The corrected DOI is what this page links to.
- **Reference 76** is used by the manuscript as general supporting context
  for individualising anticoagulant choice. Independent verification found
  two overstatements: the cited paper assessed bleeding/safety only, not
  efficacy, and its pooled bleeding result was not statistically significant
  (OR 0.79, 95% CI 0.60–1.04). The source's own authors explicitly caution
  that anticoagulant choice "must be based on the single patient" rather
  than generalised — flagged in the reference's own `kind` field in
  `assets/content.js` rather than silently repeated. It is not used on any
  flowchart node.
- **Reference 84** is garbled in the manuscript (wrong journal, year, and
  DOI). Independent searching identified the likely intended source — Kim JH
  et al. 2003, *Korean Circulation Journal* 33(7):559–567 — but even that
  paper's own numbers (117 patients; 30.4%/31.6%/15.8%/18.2%) do not match
  the manuscript's claimed figures (160 patients; 31.0%/31.3%/12.9%). Shown
  here with the corrected citation and that discrepancy flagged in `kind`.
  It is not used on any flowchart node.
- **References 18, 86, 89, 92 and 102** each carry a minor or more
  significant verification note in their own `kind` field: ref 18 has a
  one-page discrepancy in its page range (likely an abbreviated-range
  artefact, content otherwise confirmed accurate); refs 86, 89, 92 and 102
  could not be independently located despite extensive searching and are
  flagged as unverifiable rather than presented as confirmed. None of these
  five is used on any flowchart node.

All 104 manuscript references were independently re-verified against their
primary sources before inclusion. Everything else not flagged above is
paraphrased from a cited source, listed in the References section at the
bottom of the page.

This is also the first tool in the atlas whose source algorithm fans out to
three parallel alternatives (the three LMWH choices, then again the three
renal-function tiers) that all reconverge on a single downstream box.
`assets/app.js` handles this with the same named-group mechanism every other
tool in the atlas uses for a YES/NO pair, generalized to 3-wide rows (see
`GROUP_COLUMNS` and the `flow-wrap-3` CSS class) — the fan-in needs no
special handling beyond that, since each edge is computed independently and
multiple curves simply converge on the same target point.

## Disclaimer

This is an academic / educational reference tool, not a substitute for
institutional protocol or bedside clinical judgement. Verify any dose or
threshold against current local protocol before clinical use.

## How it's built

Plain HTML/CSS/JS, no build step and no framework — a single static site
that GitHub Pages can serve directly.

```
index.html          page structure
assets/style.css     design (the "paper" masthead/references,
                      the diagram scope + readout panel)
assets/content.js     ← single source of truth for every node's text,
                      dosing, and reference list. Edit this file to change
                      what the page says.
assets/app.js         rendering + interaction (builds the diagram and the
                      connector lines from content.js, handles the
                      click-to-expand panel on desktop and the bottom
                      sheet on mobile)
```

### Running it locally

No install needed:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

### Editing content

Open `assets/content.js`. Each entry in `NODES` is one box or decision
diamond from the algorithm (`meaning`, `rationale`, optional `dose` table,
and `refs` pointing at numbered entries in `REFERENCES`). Add or edit a
reference in `REFERENCES` and point to it by `id` from any node. Never
change a node's `label` or `sub` text without the author team's
sign-off — those fields are the algorithm itself, transcribed verbatim from
Figure 2. Every `sub` field carries the source box's own bullet points as
literal `\n` line breaks — preserve those exactly; they render as separate
lines, not flattened into comma-separated prose, because that is how the
original boxes are drawn.

### Building the next tool in this atlas

See [`METHODOLOGY.md`](METHODOLOGY.md) — the full build/verification
process (fidelity rule, content schema, citation verification, QA steps),
written so that any collaborator or AI assistant can pick up this project
in a fresh session and build the next tool the same way.

## License

Content and code are released under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) —
share and adapt with attribution, non-commercially, under the same license.
