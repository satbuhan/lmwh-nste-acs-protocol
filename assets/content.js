// content.js — LMWH Selection & Renal Dosing in NSTE-ACS
// Data only. Rendering logic lives in app.js.
// Co-authored by Dr. Satuk Buğra Han Bozatlı and Dr. Özgür Karıoğlu.
// Source: systematic review of enoxaparin, dalteparin and nadroparin in
// unstable angina / NSTEMI (LMWH3 NSTE-ACS SR manuscript, Figure 2).
// See METHODOLOGY.md for the fidelity rules this file follows: label/sub/dose
// text is byte-for-byte as authored; meaning/rationale/refs are added research.

const REFERENCES = [
  {
    id: 1,
    kind: "2023 ESC guideline for ACS management; independently verified (title, journal, DOI all confirmed).",
    text: "Byrne, R.A. et al. (2023) '2023 ESC Guidelines for the management of acute coronary syndromes', Eur Heart J 44(38): 3720-3826.",
    url: "https://doi.org/10.1093/eurheartj/ehad191"
  },
  {
    id: 2,
    kind: "2020 ESC NSTE-ACS guideline; independently verified.",
    text: "Collet, J.P. et al. (2021) '2020 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation', Eur Heart J 42(14): 1289-1367.",
    url: "https://doi.org/10.1093/eurheartj/ehaa575"
  },
  {
    id: 3,
    kind: "2025 ACC/AHA/ACEP/NAEMSP/SCAI NSTE-ACS guideline; independently verified.",
    text: "Rao, S.V. et al. (2025) '2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines', Circulation 151(13): e771-e862.",
    url: "https://doi.org/10.1161/CIR.0000000000001309"
  },
  {
    id: 4,
    kind: "2014 AHA/ACC NSTE-ACS guideline; independently verified (confirmed as the full guideline, distinct from its separately-paginated executive summary).",
    text: "Amsterdam, E.A. et al. (2014) '2014 AHA/ACC guideline for the management of patients with non-ST-elevation acute coronary syndromes: a report of the American College of Cardiology/American Heart Association Task Force on Practice Guidelines', Circulation 130(25): e344-426.",
    url: "https://doi.org/10.1161/CIR.0000000000000134"
  },
  {
    id: 5,
    kind: "2015 ESC NSTE-ACS guideline; independently verified.",
    text: "Roffi, M. et al. (2015) '2015 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation: Task Force for the Management of Acute Coronary Syndromes in Patients Presenting without Persistent ST-Segment Elevation of the European Society of Cardiology (ESC)', Eur Heart J 37(3): 267-315.",
    url: "https://doi.org/10.1093/eurheartj/ehv320"
  },
  {
    id: 6,
    kind: "Meta-analysis of heparin vs placebo/no anticoagulant in ACS; independently verified — the \"roughly halves the risk\" claim matches the source's own pooled OR of 0.53.",
    text: "Eikelboom, J.W. et al. (2000) 'Unfractionated heparin and low-molecular-weight heparin in acute coronary syndrome without ST elevation: a meta-analysis', Lancet 355(9219): 1936-42.",
    url: "https://doi.org/10.1016/S0140-6736(00)02324-2"
  },
  {
    id: 7,
    kind: "Cochrane review, heparin vs placebo in ACS; independently verified — MI reduction (RR 0.40) and increased minor bleeding (RR 6.80) both match the source exactly.",
    text: "Magee, K.D. et al. (2008) 'Heparin versus placebo for acute coronary syndromes', Cochrane Database Syst Rev(2): CD003462.",
    url: "https://doi.org/10.1002/14651858.CD003462.pub2"
  },
  {
    id: 8,
    kind: "Updated Cochrane review (2014) of the same comparison; independently verified, same effect sizes as its 2008 predecessor (ref 7).",
    text: "Andrade-Castellanos, C.A. et al. (2014) 'Heparin versus placebo for non-ST elevation acute coronary syndromes', Cochrane Database Syst Rev 2014(6): CD003462.",
    url: "https://doi.org/10.1002/14651858.CD003462.pub3"
  },
  {
    id: 9,
    kind: "Meta-analysis of antithrombotic therapy timing in NSTE-ACS; independently verified — both the ~89,000-patient figure and the aspirin+LMWH vs aspirin+UFH OR (0.81) match the source exactly.",
    text: "Galli, M. et al. (2020) 'Antithrombotic therapy in the early phase of non-ST-elevation acute coronary syndromes: a systematic review and meta-analysis', Eur Heart J Cardiovasc Pharmacother 6(1): 43-56.",
    url: "https://doi.org/10.1093/ehjcvp/pvz031"
  },
  {
    id: 10,
    kind: "General review of LMWH use in ACS/PCI; independently verified bibliographically.",
    text: "Wong, G.C. et al. (2003) 'Use of low-molecular-weight heparins in the management of acute coronary artery syndromes and percutaneous coronary intervention', JAMA 289(3): 331-42.",
    url: "https://doi.org/10.1001/jama.289.3.331"
  },
  {
    id: 11,
    kind: "General review of LMWH in ACS; bibliographically confirmed as a real paper, but the abstract itself could not be independently re-fetched to check the (generic, low-stakes) claim attributed to it.",
    text: "Huber, K. et al. (2001) 'Low molecular weight heparins in acute coronary syndrome', Herz 26 Suppl 1: 53-60.",
    url: "https://doi.org/10.1007/pl00014033"
  },
  {
    id: 12,
    kind: "General review of LMWHs in ACS treatment; well-established, frequently-cited paper, confirmed to exist; abstract not independently re-fetched for this low-stakes generic claim.",
    text: "Turpie, A.G. and Antman, E.M. (2001) 'Low-molecular-weight heparins in the treatment of acute coronary syndromes', Arch Intern Med 161(12): 1484-90.",
    url: "https://doi.org/10.1001/archinte.161.12.1484"
  },
  {
    id: 13,
    kind: "Review of LMWH's role in ACS management; independently verified.",
    text: "Cohen, M. (2003) 'The role of low-molecular-weight heparin in the management of acute coronary syndromes', J Am Coll Cardiol 41(4 Suppl S): 55S-61S.",
    url: "https://doi.org/10.1016/s0735-1097(02)02901-7"
  },
  {
    id: 14,
    kind: "Review concluding LMWH therapeutic equivalence was unestablished; independently verified — its own stated conclusion (\"only 1 trial has evaluated 2 LMWHs in a direct comparison\") directly supports the claim made from it here.",
    text: "McCart, G.M. and Kayser, S.R. (2002) 'Therapeutic equivalency of low-molecular-weight heparins', Ann Pharmacother 36(6): 1042-57.",
    url: "https://doi.org/10.1345/aph.10264"
  },
  {
    id: 15,
    kind: "Cochrane review, LMWH vs UFH in ACS; independently verified — MI (RR 0.83) and revascularisation (RR 0.88) reductions, and the review's own statement that data were insufficient to compare different LMWHs, both match exactly.",
    text: "Magee, K.D. et al. (2003) 'Low molecular weight heparins versus unfractionated heparin for acute coronary syndromes', Cochrane Database Syst Rev 2003(1): CD002132.",
    url: "https://doi.org/10.1002/14651858.CD002132"
  },
  {
    id: 16,
    kind: "EVET trial (enoxaparin vs tinzaparin), original report; independently verified. Tinzaparin itself has never been tested against UFH or placebo in NSTE-ACS, which is why this review excludes it from its own comparison.",
    text: "Michalis, L.K. et al. (2003) 'Enoxaparin versus tinzaparin in non-ST-segment elevation acute coronary syndromes: the EVET trial', Am Heart J 146(2): 304-10.",
    url: "https://doi.org/10.1016/S0002-8703(03)00179-0"
  },
  {
    id: 17,
    kind: "Review of anticoagulation in ACS; bibliographic details consistently attested across independent sources, though the abstract itself could not be re-fetched for this low-stakes generic claim.",
    text: "Zeitouni, M. et al. (2018) 'Anticoagulation in Acute Coronary Syndrome-State of the Art', Prog Cardiovasc Dis 60(4-5): 508-513.",
    url: "https://doi.org/10.1016/j.pcad.2018.01.004"
  },
  {
    id: 18,
    kind: "Dutch national survey of guideline adherence; independently verified, including all three specific percentages cited (97% LMWH use, 71% no renal dose adjustment, 92% no age adjustment). Minor note: the reference list gives the end page as \"291-9\" (i.e. 291-299); the publisher's own page gives 291-300 — a trivial one-page discrepancy, not a substantive error.",
    text: "Kikkert, W.J. et al. (2010) 'Guideline adherence for antithrombotic therapy in acute coronary syndrome: an overview in Dutch hospitals', Neth Heart J 18(6): 291-9.",
    url: "https://doi.org/10.1007/BF03091779"
  },
  {
    id: 19,
    kind: "Pharmacoeconomic modelling study; independently verified — its conclusion (\"none of the LMWHs demonstrated significant superiority\") matches the claim made from it, though this review's own Discussion (Section 5.2) explicitly argues this reasoning conflates absence of proven difference with proof of equivalence.",
    text: "Kadusevicius, E. et al. (2010) 'Low-molecular-weight heparins: pharmacoeconomic decision modeling based on meta-analysis data', Int J Technol Assess Health Care 26(3): 272-9.",
    url: "https://doi.org/10.1017/S0266462310000310"
  },
  {
    id: 20,
    kind: "Review asking whether LMWHs are interchangeable; independently verified.",
    text: "White, R.H. and Ginsberg, J.S. (2003) 'Low-molecular-weight heparins: are they all the same?', Br J Haematol 121(1): 12-20.",
    url: "https://doi.org/10.1046/j.1365-2141.2003.04196.x"
  },
  {
    id: 21,
    kind: "Review of generic LMWH considerations; independently verified.",
    text: "Fareed, J. et al. (2004) 'Generic low-molecular-weight heparins: some practical considerations', Semin Thromb Hemost 30(6): 703-13.",
    url: "https://doi.org/10.1055/s-2004-861513"
  },
  {
    id: 22,
    kind: "Review of differences among LMWHs in ACS; independently verified.",
    text: "Nicolau, J.C. et al. (2009) 'Differences among low-molecular-weight heparins: evidence in patients with acute coronary syndromes', J Cardiovasc Pharmacol 53(6): 440-5.",
    url: "https://doi.org/10.1097/FJC.0b013e3181a59abc"
  },
  {
    id: 23,
    kind: "Systematic overview of enoxaparin vs UFH trials; independently verified — every number drawn from it (6 trials, 21,946 patients, OR 0.91, subgroup OR 0.81) matches the source exactly.",
    text: "Petersen, J.L. et al. (2004) 'Efficacy and bleeding complications among patients randomized to enoxaparin or unfractionated heparin for antithrombin therapy in non-ST-Segment elevation acute coronary syndromes: a systematic overview', JAMA 292(1): 89-96.",
    url: "https://doi.org/10.1001/jama.292.1.89"
  },
  {
    id: 24,
    kind: "Meta-analysis of enoxaparin vs UFH across the ACS spectrum; independently verified — every number (12 trials, 49,088 patients, OR 0.84 for death/MI, OR 1.25 for bleeding) matches the source exactly.",
    text: "Murphy, S.A. et al. (2007) 'Efficacy and safety of the low-molecular weight heparin enoxaparin compared with unfractionated heparin across the acute coronary syndrome spectrum: a meta-analysis', Eur Heart J 28(17): 2077-86.",
    url: "https://doi.org/10.1093/eurheartj/ehm224"
  },
  {
    id: 25,
    kind: "Comparative LMWH pharmacokinetics review; independently verified.",
    text: "Samama, M.M. and Gerotziafas, G.T. (2000) 'Comparative pharmacokinetics of LMWHs', Semin Thromb Hemost 26 Suppl 1: 31-8.",
    url: "https://doi.org/10.1055/s-2000-9497"
  },
  {
    id: 26,
    kind: "Review of heparin and LMWH pharmacology; independently verified.",
    text: "Gray, E. et al. (2008) 'Heparin and low-molecular-weight heparin', Thromb Haemost 99(5): 807-18.",
    url: "https://doi.org/10.1160/TH08-01-0032"
  },
  {
    id: 27,
    kind: "Review of LMWH clinical pharmacology; independently verified (title, authors, pages, DOI all confirmed).",
    text: "Hao, C. et al. (2019) 'Low molecular weight heparins and their clinical applications', Prog Mol Biol Transl Sci 163: 21-39.",
    url: "https://doi.org/10.1016/bs.pmbts.2019.02.003"
  },
  {
    id: 28,
    kind: "ACCP evidence-based guideline chapter on parenteral anticoagulants (8th ed.); independently verified.",
    text: "Hirsh, J. et al. (2008) 'Parenteral anticoagulants: American College of Chest Physicians Evidence-Based Clinical Practice Guidelines (8th Edition)', Chest 133(6 Suppl): 141S-159S.",
    url: "https://doi.org/10.1378/chest.08-0689"
  },
  {
    id: 29,
    kind: "ACCP evidence-based guideline chapter on parenteral anticoagulants (9th ed.); independently verified.",
    text: "Garcia, D.A. et al. (2012) 'Parenteral anticoagulants: Antithrombotic Therapy and Prevention of Thrombosis, 9th ed: American College of Chest Physicians Evidence-Based Clinical Practice Guidelines', Chest 141(2 Suppl): e24S-e43S.",
    url: "https://doi.org/10.1378/chest.11-2291"
  },
  {
    id: 30,
    kind: "Laboratory study of anti-Xa/anti-IIa activity and thrombin generation; independently verified, supports the claim that LMWHs differ in their capacity to inhibit thrombin generation.",
    text: "Gerotziafas, G.T. et al. (2007) 'Effect of the anti-factor Xa and anti-factor IIa activities of low-molecular-weight heparins upon the phases of thrombin generation', J Thromb Haemost 5(5): 955-62.",
    url: "https://doi.org/10.1111/j.1538-7836.2007.02477.x"
  },
  {
    id: 31,
    kind: "Review of LMWH product individuality (branded vs generic); independently verified.",
    text: "Maddineni, J. et al. (2006) 'Product individuality of commercially available low-molecular-weight heparins and their generic versions: therapeutic implications', Clin Appl Thromb Hemost 12(3): 267-76.",
    url: "https://doi.org/10.1177/1076029606291434"
  },
  {
    id: 32,
    kind: "In vitro study of LMWH effects on vascular tone; independently verified — confirms agent-specific, nitric-oxide-mediated vasodilatory differences.",
    text: "Tasatargil, A. et al. (2005) 'Comparison of the vasodilatory effect of nadroparin, enoxaparin, dalteparin, and unfractioned heparin in human internal mammary artery', J Cardiovasc Pharmacol 45(6): 550-4.",
    url: "https://doi.org/10.1097/01.fjc.0000159878.66325.fc"
  },
  {
    id: 33,
    kind: "In vitro study of LMWHs and catheter thrombosis; independently verified.",
    text: "Raaz, U. et al. (2010) 'Efficacy of enoxaparin, certoparin and dalteparin in preventing cardiac catheter thrombosis: an in vitro approach', J Thromb Thrombolysis 29(3): 265-70.",
    url: "https://doi.org/10.1007/s11239-009-0355-x"
  },
  {
    id: 34,
    kind: "Crossover study of LMWH effects on tissue factor pathway inhibitor during haemodialysis; independently verified bibliographically (note: epub 2010, print 2011 — the manuscript's \"(2010)\" reflects the epub date). The paper's title directly supports that the three agents differ in TFPI effects.",
    text: "Naumnik, B. et al. (2010) 'Different effects of enoxaparin, nadroparin, and dalteparin on plasma TFPI during hemodialysis: a prospective crossover randomized study', Clin Appl Thromb Hemost 17(5): 480-6.",
    url: "https://doi.org/10.1177/1076029610376936"
  },
  {
    id: 35,
    kind: "Review of LMWH use in renal insufficiency; independently verified — confirms enoxaparin has the most accumulation data and dalteparin appears to accumulate less.",
    text: "Schmid, P. et al. (2009) 'Low-molecular-weight heparin in patients with renal insufficiency', Swiss Med Wkly 139(31-32): 438-52.",
    url: "https://doi.org/10.4414/smw.2009.11284"
  },
  {
    id: 36,
    kind: "Systematic review of prophylactic-dose LMWH accumulation in renal insufficiency; independently verified — confirms dalteparin did not accumulate while enoxaparin did, exactly as cited.",
    text: "Atiq, F. et al. (2015) 'A systematic review on the accumulation of prophylactic dosages of low-molecular-weight heparins (LMWHs) in patients with renal insufficiency', Eur J Clin Pharmacol 71(8): 921-9.",
    url: "https://doi.org/10.1007/s00228-015-1880-5"
  },
  {
    id: 37,
    kind: "Review of LMWH/anticoagulant use in elderly patients with renal impairment; independently verified.",
    text: "Samama, M.M. (2011) 'Use of low-molecular-weight heparins and new anticoagulants in elderly patients with renal impairment', Drugs Aging 28(3): 177-93.",
    url: "https://doi.org/10.2165/11586730-000000000-00000"
  },
  {
    id: 38,
    kind: "Review of LMWH dosing/monitoring in special populations; independently verified.",
    text: "Duplaga, B.A. et al. (2001) 'Dosing and monitoring of low-molecular-weight heparins in special populations', Pharmacotherapy 21(2): 218-34.",
    url: "https://doi.org/10.1592/phco.21.2.218.34112"
  },
  {
    id: 39,
    kind: "Review of LMWH dosing in renal impairment and obesity; independently verified.",
    text: "Nutescu, E.A. et al. (2009) 'Low-molecular-weight heparins in renal impairment and obesity: available evidence and clinical practice recommendations across medical and surgical settings', Ann Pharmacother 43(6): 1064-83.",
    url: "https://doi.org/10.1345/aph.1L194"
  },
  {
    id: 40,
    kind: "Population pharmacokinetic study of enoxaparin in unstable angina/NSTEMI; independently verified — the specific \"3.8-fold\" bleeding-risk figure matches the source exactly.",
    text: "Bruno, R. et al. (2003) 'Population pharmacokinetics and pharmacodynamics of enoxaparin in unstable angina and non-ST-segment elevation myocardial infarction', Br J Clin Pharmacol 56(4): 407-14.",
    url: "https://doi.org/10.1046/j.1365-2125.2003.01904.x"
  },
  {
    id: 41,
    kind: "Study linking anti-Xa activity to survival on enoxaparin; independently verified — the \"below 0.5 IU/mL\" mortality-association threshold matches the source exactly.",
    text: "Montalescot, G. et al. (2004) 'Anti-Xa activity relates to survival and efficacy in unselected acute coronary syndrome patients treated with enoxaparin', Circulation 110(4): 392-8.",
    url: "https://doi.org/10.1161/01.CIR.0000136830.65073.C7"
  },
  {
    id: 42,
    kind: "Study of dalteparin anti-Xa activity by gender; independently verified — both the gender gap and the 33% subtherapeutic-levels finding match the source exactly.",
    text: "Oldgren, J. et al. (2008) 'Xa inhibition and coagulation activity--the influence of prolonged dalteparin treatment and gender in patients with acute coronary syndrome and healthy individuals', Am Heart J 155(3): 493.e1-8.",
    url: "https://doi.org/10.1016/j.ahj.2007.12.006"
  },
  {
    id: 43,
    kind: "Meta-analysis of LMWH bleeding risk in severe renal insufficiency; independently verified — confirms the enoxaparin bleeding-risk finding and that dalteparin data were explicitly insufficient for conclusions, exactly as cited.",
    text: "Lim, W. et al. (2006) 'Meta-analysis: low-molecular-weight heparin and bleeding in patients with severe renal insufficiency', Ann Intern Med 144(9): 673-84.",
    url: "https://doi.org/10.7326/0003-4819-144-9-200605020-00011"
  },
  {
    id: 44,
    kind: "Pooled analysis of LMWH-associated delayed-type cutaneous hypersensitivity; independently verified — nadroparin's OR of 30.2 (95% CI 11.7-77.9) matches the source exactly.",
    text: "Schindewolf, M. et al. (2017) 'Nadroparin carries a potentially high risk of inducing cutaneous delayed-type hypersensitivity responses', Contact Dermatitis 77(1): 35-41.",
    url: "https://doi.org/10.1111/cod.12764"
  },
  {
    id: 45,
    kind: "Korean cohort study of suspected heparin-induced thrombocytopenia; independently verified — the 6,046-patient cohort and both hazard ratios (enoxaparin 0.40, dalteparin 0.55, both p<0.05 vs UFH) match the source exactly.",
    text: "Kim, H.S. et al. (2017) 'Comparative Analysis of the Suspected Heparin-Induced Thrombocytopenia Level in Korea', Basic Clin Pharmacol Toxicol 121(4): 360-367.",
    url: "https://doi.org/10.1111/bcpt.12791"
  },
  {
    id: 46,
    kind: "PRISMA 2020 reporting statement; independently verified.",
    text: "Page, M.J. et al. (2021) 'The PRISMA 2020 statement: an updated guideline for reporting systematic reviews', BMJ 372: n71.",
    url: "https://doi.org/10.1136/bmj.n71"
  },
  {
    id: 47,
    kind: "RoB 2 risk-of-bias tool; independently verified — its five domains match this review's own description of how trials were assessed.",
    text: "Sterne, J.A.C. et al. (2019) 'RoB 2: a revised tool for assessing risk of bias in randomised trials', BMJ 366: l4898.",
    url: "https://doi.org/10.1136/bmj.l4898"
  },
  {
    id: 48,
    kind: "robvis risk-of-bias visualisation tool; independently verified (minor note: epub 2020, formally published 2021 — a common, accepted citation convention, not a misrepresentation).",
    text: "McGuinness, L.A. and Higgins, J.P.T. (2020) 'Risk-of-bias VISualization (robvis): An R package and Shiny web app for visualizing risk-of-bias assessments', Res Synth Methods 12(1): 55-61.",
    url: "https://doi.org/10.1002/jrsm.1411"
  },
  {
    id: 49,
    kind: "Method for converting odds ratio to standardised effect size; independently verified — the manuscript's stated formula (d = ln(OR) x sqrt(3)/pi) is algebraically identical to the transformation this source describes.",
    text: "Chinn, S. (2000) 'A simple method for converting an odds ratio to effect size for use in meta-analysis', Stat Med 19(22): 3127-31.",
    url: "https://doi.org/10.1002/1097-0258(20001130)19:22%3c3127::aid-sim784%3e3.0.co;2-m"
  },
  {
    id: 50,
    kind: "Study establishing \"half a standard deviation\" as an empirical minimally-important-difference threshold; independently verified in substance and correctly scoped to this review's own |d| >= 0.50 \"moderate effect\" threshold (not misattributed to its |d| >= 0.20 MCID, which is presented as a separate, conventional threshold). One correction: the DOI printed in the reference list does not resolve; the real DOI is 10.1097/00005650-200305000-00004 (corrected here).",
    text: "Norman, G.R. et al. (2003) 'Interpretation of changes in health-related quality of life: the remarkable universality of half a standard deviation', Med Care 41(5): 582-92.",
    url: "https://doi.org/10.1097/00005650-200305000-00004"
  },
  {
    id: 51,
    kind: "Paper introducing the I-squared statistic for heterogeneity; independently verified.",
    text: "Higgins, J.P. et al. (2003) 'Measuring inconsistency in meta-analyses', BMJ 327(7414): 557-60.",
    url: "https://doi.org/10.1136/bmj.327.7414.557"
  },
  {
    id: 52,
    kind: "GRADE framework for rating evidence certainty; independently verified.",
    text: "Guyatt, G.H. et al. (2008) 'GRADE: an emerging consensus on rating quality of evidence and strength of recommendations', BMJ 336(7650): 924-6.",
    url: "https://doi.org/10.1136/bmj.39489.470347.AD"
  },
  {
    id: 53,
    kind: "GRADE guidance, evidence profiles and summary-of-findings tables; independently verified.",
    text: "Guyatt, G. et al. (2010) 'GRADE guidelines: 1', Introduction-GRADE evidence profiles and summary of findings tables. J Clin Epidemiol 64(4): 383-94.",
    url: "https://doi.org/10.1016/j.jclinepi.2010.04.026"
  },
  {
    id: 54,
    kind: "GRADE guidance on rating down for study limitations/risk of bias; independently verified.",
    text: "Guyatt, G.H. et al. (2011) 'GRADE guidelines: 4', Rating the quality of evidence--study limitations (risk of bias). J Clin Epidemiol 64(4): 407-15.",
    url: "https://doi.org/10.1016/j.jclinepi.2010.07.017"
  },
  {
    id: 55,
    kind: "GRADE guidance on rating down for imprecision; independently verified.",
    text: "Guyatt, G.H. et al. (2011) 'GRADE guidelines 6', Rating the quality of evidence--imprecision. J Clin Epidemiol 64(12): 1283-93.",
    url: "https://doi.org/10.1016/j.jclinepi.2011.01.012"
  },
  {
    id: 56,
    kind: "A 2002 dalteparin-vs-enoxaparin haemostatic-parameters study; independently confirmed as a real paper, but this review itself could not obtain an abstract or full text for it — honestly reported as not assessable rather than cited with invented findings.",
    text: "Hödl, R. et al. (2002) 'Comparison of effects of dalteparin and enoxaparin on hemostatic parameters and von Willebrand factor in patients with unstable angina pectoris or non--ST- segment elevation acute myocardial infarction', Am J Cardiol 89(5): 589-92.",
    url: "https://doi.org/10.1016/s0002-9149(01)02300-1"
  },
  {
    id: 57,
    kind: "Published protocol for a nadroparin-vs-enoxaparin trial in renal insufficiency; independently verified as a genuine protocol-only paper with no results ever published, exactly as this review describes it.",
    text: "Gurfinkel, E.P. et al. (2004) 'Nadroparine calcium or enoxaparine in acute coronary syndrome patients suffering renal insufficiency: The nadroparin versus enoxaparin (NaVe) study design', Thromb J 2(1): 6.",
    url: "https://doi.org/10.1186/1477-9560-2-6"
  },
  {
    id: 58,
    kind: "EVET trial, 6-month follow-up report; independently verified, and correctly distinguished in this review from the separate 2003 original EVET report (ref 16).",
    text: "Katsouras, C. et al. (2005) 'Enoxaparin versus tinzaparin in non-ST-segment elevation acute coronary syndromes: results of the enoxaparin versus tinzaparin (EVET) trial at 6 months', Am Heart J 150(3): 385-91.",
    url: "https://doi.org/10.1016/j.ahj.2004.09.028"
  },
  {
    id: 59,
    kind: "Enoxaparin-vs-dalteparin RCT (Ozdemir et al. 2002); independently verified against the trial's own abstract — every number this review draws from it (n=142, composite 16% vs 19%, OR 0.80, time-to-first-event difference, minor-bleeding OR 0.81) reproduces exactly.",
    text: "Ozdemir, M. et al. (2002) 'Head-to-head comparison of two different low-molecular-weight heparins in acute coronary syndrome: a single center experience', Jpn Heart J 43(5): 433-42.",
    url: "https://doi.org/10.1536/jhj.43.433"
  },
  {
    id: 60,
    kind: "ARMADA trial (enoxaparin vs dalteparin vs UFH); independently verified — the three-arm composite percentages (13%/19%/28%) and the recalculated enoxaparin-vs-dalteparin OR (0.65) both match the primary source.",
    text: "Montalescot, G. et al. (2003) 'Comparison of effects on markers of blood cell activation of enoxaparin, dalteparin, and unfractionated heparin in patients with unstable angina pectoris or non-ST-segment elevation acute myocardial infarction (the ARMADA study)', Am J Cardiol 91(8): 925-30.",
    url: "https://doi.org/10.1016/s0002-9149(03)00105-x"
  },
  {
    id: 61,
    kind: "Enoxaparin-vs-nadroparin RCT with tirofiban (Okmen et al. 2003); independently verified against the trial's own abstract — every percentage this review cites (MI, recurrent angina, death, revascularisation, total MACE 19% vs 15%) matches exactly.",
    text: "Okmen, E. et al. (2003) 'Effects of enoxaparin and nadroparin on major cardiac events in high-risk unstable angina treated with a glycoprotein IIb/IIIa inhibitor', Jpn Heart J 44(6): 899-906.",
    url: "https://doi.org/10.1536/jhj.44.899"
  },
  {
    id: 62,
    kind: "ESCAPe-END trial, the only three-way enoxaparin/nadroparin/dalteparin comparison; independently verified — PROBE design, n=150, 30-day no-significant-difference result, and similar cost/PAI-1/adverse-event findings all match the source.",
    text: "Shafiq, N. et al. (2006) 'A randomized controlled clinical trial to evaluate the efficacy, safety, cost-effectiveness and effect on PAI-1 levels of the three low-molecular-weight heparins--enoxaparin, nadroparin and dalteparin', The ESCAPe-END study. Pharmacology 78(3): 136-43.",
    url: "https://doi.org/10.1159/000096484"
  },
  {
    id: 63,
    kind: "Enoxaparin-vs-nadroparin anti-Xa pharmacodynamic trial (Ostadal et al. 2008); independently verified — anti-Xa levels (0.65 vs 0.30 IU/mL), target attainment (66.7% vs 10.0%), and the derived RR/Cohen's d all reproduce exactly from the primary data.",
    text: "Ostadal, P. et al. (2008) 'Anti-Xa activity of enoxaparin and nadroparin in patients with acute coronary syndrome', Exp Clin Cardiol 13(4): 175-8..",
    url: "https://pubmed.ncbi.nlm.nih.gov/19343162/"
  },
  {
    id: 64,
    kind: "Enoxaparin/dalteparin/UFH RCT (Ahmed et al. 2011); independently verified — death and STEMI counts by arm match exactly, and the recalculated enoxaparin-vs-dalteparin death OR (~0.19) matches the source.",
    text: "Ahmed, M. et al. (2011) 'Comparison of enoxaparin and dalteparin with unfractionated heparin in the treatment of non-ST elevated acute coronary syndrome', J Ayub Med Coll Abbottabad 23(3): 60-3..",
    url: "https://pubmed.ncbi.nlm.nih.gov/23272437/"
  },
  {
    id: 65,
    kind: "INTERACT trial; independently verified — bleeding (1.8% vs 4.6%) and 30-day death/MI (5.0% vs 9.0%) figures match the source exactly.",
    text: "Goodman, S.G. et al. (2003) 'Randomized evaluation of the safety and efficacy of enoxaparin versus unfractionated heparin in high-risk patients with non-ST-segment elevation acute coronary syndromes receiving the glycoprotein IIb/IIIa inhibitor eptifibatide', Circulation 107(2): 238-44.",
    url: "https://doi.org/10.1161/01.cir.0000050144.67910.13"
  },
  {
    id: 66,
    kind: "ACUTE II trial; independently verified — total bleeding rates (3.5% vs 4.8%, OR 1.4, not significant) match the source.",
    text: "Cohen, M. et al. (2002) 'Randomized double-blind safety study of enoxaparin versus unfractionated heparin in patients with non-ST-segment elevation acute coronary syndromes treated with tirofiban and aspirin: the ACUTE II study', The Antithrombotic Combination Using Tirofiban and Enoxaparin. Am Heart J 144(3): 470-7.",
    url: "https://doi.org/10.1067/mhj.2002.126115"
  },
  {
    id: 67,
    kind: "A to Z trial, phase A; independently verified — the 8.4% vs 9.4% (HR 0.88) non-inferiority result matches the source exactly.",
    text: "Blazing, M.A. et al. (2004) 'Safety and efficacy of enoxaparin vs unfractionated heparin in patients with non-ST-segment elevation acute coronary syndromes who receive tirofiban and aspirin: a randomized controlled trial', JAMA 292(1): 55-64.",
    url: "https://doi.org/10.1001/jama.292.1.55"
  },
  {
    id: 68,
    kind: "SYNERGY trial; independently verified — 30-day death/MI (14.0% vs 14.5%, OR 0.96) and TIMI major bleeding (9.1% vs 7.6%) both match the source exactly.",
    text: "Ferguson, J.J. et al. (2004) 'Enoxaparin vs unfractionated heparin in high-risk patients with non-ST-segment elevation acute coronary syndromes managed with an intended early invasive strategy: primary results of the SYNERGY randomized trial', JAMA 292(1): 45-54.",
    url: "https://doi.org/10.1001/jama.292.1.45"
  },
  {
    id: 69,
    kind: "SYNERGY PCI substudy; independently verified — similar ischaemic outcomes (13.1% vs 14.2%) but higher bleeding with crossover between anticoagulants (3.7%->7.8% and 2.5%->8.6%) match the source precisely.",
    text: "White, H.D. et al. (2006) 'Efficacy and safety of enoxaparin compared with unfractionated heparin in high-risk patients with non-ST-segment elevation acute coronary syndrome undergoing percutaneous coronary intervention in the Superior Yield of the New Strategy of Enoxaparin, Revascularization and Glycoprotein IIb/IIIa Inhibitors (SYNERGY) trial', Am Heart J 152(6): 1042-50.",
    url: "https://doi.org/10.1016/j.ahj.2006.08.002"
  },
  {
    id: 70,
    kind: "PCI-after-subcutaneous-enoxaparin safety study; independently verified — the source's own abstract states PCI within 8 hours of the last dose \"seems to be safe and effective\", matching the claim made from it.",
    text: "Collet, J.P. et al. (2001) 'Percutaneous coronary intervention after subcutaneous enoxaparin pretreatment in patients with unstable angina pectoris', Circulation 103(5): 658-63.",
    url: "https://doi.org/10.1161/01.cir.103.5.658"
  },
  {
    id: 71,
    kind: "A companion PCI-safety analysis (with ref 70); independently verified bibliographically and confirmed to assess PCI safety after enoxaparin pretreatment, though the specific \"8 hours\" figure is more directly carried by ref 70.",
    text: "Fox, K.A. et al. (2002) 'Comparison of enoxaparin versus unfractionated heparin in patients with unstable angina pectoris/non-ST-segment elevation acute myocardial infarction having subsequent percutaneous coronary intervention', Am J Cardiol 90(5): 477-82.",
    url: "https://doi.org/10.1016/s0002-9149(02)02517-1"
  },
  {
    id: 72,
    kind: "Subgroup analysis of enoxaparin trials; independently verified — the higher-risk and ST-depression subgroup findings match the source exactly.",
    text: "Cohen, M. et al. (2001) 'Enoxaparin in unstable angina/non-ST-segment elevation myocardial infarction: treatment benefits in prespecified subgroups', J Thromb Thrombolysis 12(3): 199-206.",
    url: "https://doi.org/10.1023/a:1015259706522"
  },
  {
    id: 73,
    kind: "Indirect comparison of enoxaparin vs no anticoagulation; independently verified — the source's OR of 0.53 (a ~47% risk reduction) closely matches this review's \"halves the risk\" characterisation.",
    text: "Massel, D. and Cruickshank, M.K. (2002) 'Enoxaparin in acute coronary syndromes: evidence for superiority over placebo or untreated control', Am Heart J 143(5): 748-52.",
    url: "https://doi.org/10.1067/mhj.2002.121808"
  },
  {
    id: 74,
    kind: "Meta-analysis of enoxaparin vs UFH during PCI; independently verified — the source reports significant reductions in both mortality (RR 0.66) and major bleeding (RR 0.80), supporting rather than overstating the claim made from it.",
    text: "Silvain, J. et al. (2012) 'Efficacy and safety of enoxaparin versus unfractionated heparin during percutaneous coronary intervention: systematic review and meta-analysis', BMJ 344: e553.",
    url: "https://doi.org/10.1136/bmj.e553"
  },
  {
    id: 75,
    kind: "Meta-analysis of LMWH vs UFH during PCI; independently verified — the source's own conclusion (\"at least as efficacious and safe\") is close to a verbatim match for the claim made from it.",
    text: "Kodumuri, V. et al. (2011) 'Comparison of low molecular weight heparin with unfractionated heparin during percutaneous coronary interventions: a meta-analysis', Am J Ther 18(3): 180-9.",
    url: "https://doi.org/10.1097/MJT.0b013e3181c1218f"
  },
  {
    id: 76,
    kind: "Systematic review of LMWH vs UFH bleeding risk in acute thrombotic conditions; bibliographic details verified, but this review's use of it overstates the source two ways — the cited paper assessed bleeding/safety only, not efficacy, and its pooled bleeding result was not statistically significant (OR 0.79, 95% CI 0.60-1.04); the source's own authors explicitly caution that anticoagulant choice \"must be based on the single patient\" rather than generalised.",
    text: "Costantino, G. et al. (2012) 'Bleeding risk during treatment of acute thrombotic events with subcutaneous LMWH compared to intravenous unfractionated heparin; a systematic review', PLoS One 7(9): e44553.",
    url: "https://doi.org/10.1371/journal.pone.0044553"
  },
  {
    id: 77,
    kind: "Network meta-analysis of 42 trials/117,353 patients; independently verified — the trial/patient count and the direction of the UFH-vs-LMWH effect on MI odds both match the source exactly.",
    text: "Navarese, E.P. et al. (2015) 'Comparative efficacy and safety of anticoagulant strategies for acute coronary syndromes', Comprehensive network meta-analysis of 42 randomised trials involving 117,353 patients. Thromb Haemost 114(5): 933-44.",
    url: "https://doi.org/10.1160/TH14-12-1066"
  },
  {
    id: 78,
    kind: "OASIS-5 trial (fondaparinux vs enoxaparin); independently verified — the 9-day composite (5.7% vs 5.8%) and major bleeding (4.1% vs 2.2%) figures both match the source exactly.",
    text: "Yusuf, S. et al. (2006) 'Comparison of fondaparinux and enoxaparin in acute coronary syndromes', N Engl J Med 354(14): 1464-76.",
    url: "https://doi.org/10.1056/NEJMoa055443"
  },
  {
    id: 79,
    kind: "Cochrane review, factor Xa inhibitors in ACS; independently verified — fondaparinux-vs-enoxaparin bleeding reductions (RR 0.63 major, 0.34 minor) support the lower-bleeding claim made from it.",
    text: "Brito, V. et al. (2011) 'Factor Xa inhibitors for acute coronary syndromes', Cochrane Database Syst Rev 2011(1): CD007038.",
    url: "https://doi.org/10.1002/14651858.CD007038.pub2"
  },
  {
    id: 80,
    kind: "Meta-analysis, enoxaparin vs fondaparinux; independently verified — bleeding reductions at every time point support the claim made from it.",
    text: "Bundhun, P.K. et al. (2017) 'Choosing between Enoxaparin and Fondaparinux for the management of patients with acute coronary syndrome: A systematic review and meta-analysis', BMC Cardiovasc Disord 17(1): 116.",
    url: "https://doi.org/10.1186/s12872-017-0552-z"
  },
  {
    id: 81,
    kind: "Meta-analysis, fondaparinux vs LMWH; independently verified — major-bleeding reduction (RR 0.62-0.65) supports the claim made from it.",
    text: "Qiao, J. et al. (2015) 'Comparison between Fondaparinux and Low-Molecular-Weight Heparin in Patients with Acute Coronary Syndrome: A Meta-Analysis', Cardiology 133(3): 163-72.",
    url: "https://doi.org/10.1159/000441442"
  },
  {
    id: 82,
    kind: "H-REPLACE trial (rivaroxaban vs enoxaparin); independently verified — the non-inferiority result (HR 0.60) matches the source exactly.",
    text: "Zhou, S. et al. (2023) 'Effect of Rivaroxaban vs Enoxaparin on Major Cardiac Adverse Events and Bleeding Risk in the Acute Phase of Acute Coronary Syndrome: The H-REPLACE Randomized Equivalence and Noninferiority Trial', JAMA Netw Open 6(2): e2255709.",
    url: "https://doi.org/10.1001/jamanetworkopen.2022.55709"
  },
  {
    id: 83,
    kind: "Dalteparin-vs-UFH open-label trial; independently verified — the source's own conclusion (\"as effective and safe as\" UFH) matches the claim made from it.",
    text: "Amane, H.S. and Burte, N.P. (2011) 'A comparative study of dalteparin and unfractionated heparin in patients with unstable angina pectoris', Indian J Pharmacol 43(6): 703-6.",
    url: "https://doi.org/10.4103/0253-7613.89830"
  },
  {
    id: 84,
    kind: "This review's own reference list gives this citation incorrectly (journal, year and DOI do not resolve to any real paper). The first three authors do match a real publication — Kim, J.H. et al. (2003) 'The Long-Term Clinical Outcomes of Low Molecular Weight Heparin Combined with Platelet Glycoprotein IIb/IIIa Inhibitor in Patients with Acute Coronary Syndrome', Korean Circulation Journal, 33(7), pp. 559-567 (different journal, year, author list and patient count than cited) — shown corrected here. Even against that real paper, the specific numbers this review attributes to it do not match: the real trial enrolled 117 patients in four groups with 6-month MACE of 30.4%/31.6%/15.8%/18.2%, not the 160 patients and 31.0%/31.3%/12.9% this review states. This looks like a genuinely garbled citation in the source manuscript, not a page-number-level slip, and is not used anywhere in this tool's diagram.",
    text: "Kim, J.H. et al. (2003) 'The Long-Term Clinical Outcomes of Low Molecular Weight Heparin Combined with Platelet Glycoprotein IIb/IIIa Inhibitor in Patients with Acute Coronary Syndrome', Korean Circulation Journal, 33(7), pp. 559-567.",
    url: "https://doi.org/10.4070/kcj.2003.33.7.559"
  },
  {
    id: 85,
    kind: "GUSTO IV-ACS dalteparin substudy; independently verified — the \"as safe as\" abciximab+UFH finding and the null effect of abciximab on 30-day death/MI both match the source.",
    text: "James, S. et al. (2002) 'Safety and efficacy of abciximab combined with dalteparin in treatment of acute coronary syndromes', Eur Heart J 23(19): 1538-45.",
    url: "https://doi.org/10.1053/euhj.2002.3257"
  },
  {
    id: 86,
    kind: "Could not be independently located despite extensive targeted searching (by exact authors, journal, year and the stated PMID) — related papers by overlapping authors were found, but none matching this citation. Not confirmed to exist as described; not used anywhere in this tool's diagram.",
    text: "Dudek, D. et al. (2004) 'Safety and efficacy of dalteparin administration for elective percutaneous interventions in patients pre-treated with aspirin and ticlopidine', Przegl Lek 61(12): 1301-4..",
    url: "https://pubmed.ncbi.nlm.nih.gov/15850317/"
  },
  {
    id: 87,
    kind: "Meta-analysis of non-enoxaparin LMWH trials vs UFH; independently verified — the composite-endpoint OR of 0.83 matches the source exactly, in both the narrative text and this review's own summary table.",
    text: "Malhotra, S. et al. (2001) 'A meta-analysis of controlled clinical trials comparing low-molecular weight heparins with unfractionated heparin in unstable angina', Indian Heart J 53(2): 197-202..",
    url: "https://pubmed.ncbi.nlm.nih.gov/11428477/"
  },
  {
    id: 88,
    kind: "FRISC-II 5-year follow-up; independently verified by matching numeric results (MI 12.9% vs 17.7%, death/MI 19.9% vs 24.5%) against the primary trial report.",
    text: "Lagerqvist, B. et al. (2006) '5-year outcomes in the FRISC-II randomised trial of an invasive versus a non-invasive strategy in non-ST-elevation acute coronary syndrome: a follow-up study', Lancet 368(9540): 998-1004.",
    url: "https://doi.org/10.1016/S0140-6736(06)69416-6"
  },
  {
    id: 89,
    kind: "Could not be independently located despite more than a dozen distinct search strategies (title, authors, DOI, trial name, journal archives, author bibliographies). Not confirmed to exist as described; not used anywhere in this tool's diagram.",
    text: "Bassand, J.P. et al. (2003) 'Tolerability of percutaneous coronary interventions in patients receiving nadroparin calcium for unstable angina or non-Q-wave myocardial infarction: the Angiofrax study', Curr Med Res Opin 19(2): 107-13.",
    url: "https://doi.org/10.1185/030079902125001489"
  },
  {
    id: 90,
    kind: "Chinese nadroparin-vs-UFH PCI safety trial; independently corroborated via a bibliographic database record matching title, journal, year and pages, including the source's own typo in its title.",
    text: "Zhu, J.H. et al. (2005) 'Comparison of the antithrombotlic effect and safety between intravenous nadroparin and unfractionated heparin in patients undergoing percutaneous coronary intervention', Zhonghua Xin Xue Guan Bing Za Zhi 33(4): 335-9..",
    url: "https://pubmed.ncbi.nlm.nih.gov/15932664/"
  },
  {
    id: 91,
    kind: "Second Chinese nadroparin-dosing PCI trial; independently corroborated via a bibliographic database record — the 236-patient, two-dose comparison matches exactly.",
    text: "Sun, C.Y. et al. (2008) 'Efficacy comparison with low and high dose nadroparin for patients with acute coronary syndrome underwent percutaneous coronary intervention', Zhonghua Xin Xue Guan Bing Za Zhi 36(6): 493-6..",
    url: "https://pubmed.ncbi.nlm.nih.gov/19100058/"
  },
  {
    id: 92,
    kind: "Could not be independently located despite extensive searching by title, authors, DOI and the specific statistics cited — a journal-tracking service's listing of this author name's recent papers in this journal shows no matching article. Treat as unconfirmed; not used anywhere in this tool's diagram.",
    text: "Wang, Y. et al. (2025) 'Comparison of adverse drug reactions of heparin and its derivates in the European Economic Area based on data from EudraVigilance between 2017 and 2021', Clin Nephrol 103(4): 290-295.",
    url: "https://doi.org/10.5414/CN111448"
  },
  {
    id: 93,
    kind: "Pooled ESSENCE/TIMI 11B renal-impairment and obesity analysis; independently verified — the renal-impairment bleeding rates (6.6% vs 1.1%) and the null obesity finding both match the source exactly.",
    text: "Spinler, S.A. et al. (2003) 'Safety and efficacy of unfractionated heparin versus enoxaparin in patients who are obese and patients with severe renal impairment: analysis from the ESSENCE and TIMI 11B studies', Am Heart J 146(1): 33-41.",
    url: "https://doi.org/10.1016/S0002-8703(03)00121-2"
  },
  {
    id: 94,
    kind: "SYNERGY obesity substudy; independently verified — the \"no interaction between treatment and obesity\" finding matches the source exactly (minor note: manuscript cites the epub year 2008; the formal print year is 2010).",
    text: "Mahaffey, K.W. et al. (2008) 'Obesity in patients with non-ST-segment elevation acute coronary syndromes: results from the SYNERGY trial', Int J Cardiol 139(2): 123-33.",
    url: "https://doi.org/10.1016/j.ijcard.2008.10.008"
  },
  {
    id: 95,
    kind: "Meta-analysis of obesity and antithrombotic bleeding risk; independently verified — comparable, non-significant bleeding risk in obese vs non-obese patients on either enoxaparin or UFH matches the source exactly.",
    text: "Darzé, B.R. et al. (2025) 'Influence of Obesity on the Safety and Efficacy of Antithrombotic Therapy: A Systematic Review and Meta-Analysis', Arq Bras Cardiol 122(4): e20240544.",
    url: "https://doi.org/10.36660/abc.20240544"
  },
  {
    id: 96,
    kind: "CRUSADE registry study of excess antithrombotic dosing; independently verified — the \"15% of major bleeding attributable to excess dosing\" figure is an exact quote from the source's own abstract.",
    text: "Alexander, K.P. et al. (2005) 'Excess dosing of antiplatelet and antithrombin agents in the treatment of non-ST-segment elevation acute coronary syndromes', JAMA 294(24): 3108-16.",
    url: "https://doi.org/10.1001/jama.294.24.3108"
  },
  {
    id: 97,
    kind: "CRUSADE bleeding risk score, derivation and validation; independently verified.",
    text: "Subherwal, S. et al. (2009) 'Baseline risk of major bleeding in non-ST-segment-elevation myocardial infarction: the CRUSADE (Can Rapid risk stratification of Unstable angina patients Suppress ADverse outcomes with Early implementation of the ACC/AHA Guidelines) Bleeding Score', Circulation 119(14): 1873-82.",
    url: "https://doi.org/10.1161/CIRCULATIONAHA.108.828541"
  },
  {
    id: 98,
    kind: "ACUITY/HORIZONS-AMI bleeding risk score; independently verified.",
    text: "Mehran, R. et al. (2010) 'A risk score to predict bleeding in patients with acute coronary syndromes', J Am Coll Cardiol 55(23): 2556-66.",
    url: "https://doi.org/10.1016/j.jacc.2009.09.076"
  },
  {
    id: 99,
    kind: "Review of LMWH dose caps across jurisdictions; independently verified — confirms dose caps differ by agent and that many countries impose none, supporting the claim made from it.",
    text: "Thomson, P. et al. (2009) 'Treatment dosing of low-molecular-weight heparins and the dose cap dilemma: considerations for patients in Canada', Can J Hosp Pharm 62(5): 367-74.",
    url: "https://doi.org/10.4212/cjhp.v62i5.823"
  },
  {
    id: 100,
    kind: "Review of optimal anticoagulation duration in NSTE-ACS; independently verified — supports the point that prolonged anticoagulant exposure adds bleeding risk without added benefit beyond 5-7 days (the specific phrase \"declining role of prolonged pre-procedural anticoagulation\" is this review's own synthesis, not a verbatim quote).",
    text: "Riaz, I.B. et al. (2014) 'Optimal anticoagulation duration of unfractionated and low molecular weight heparin in non-ST elevation acute coronary syndrome: a systematic review of the literature', Int J Cardiol 177(2): 461-6.",
    url: "https://doi.org/10.1016/j.ijcard.2014.09.105"
  },
  {
    id: 101,
    kind: "Review of anticoagulation strategies around PCI; independently verified.",
    text: "Zeymer, U. et al. (2016) 'Anticoagulation in coronary intervention', Eur Heart J 37(45): 3376-3385.",
    url: "https://doi.org/10.1093/eurheartj/ehw061"
  },
  {
    id: 102,
    kind: "A companion \"Part 2\" article by the same author group, journal and volume was independently confirmed to be real; despite extensive searching, the \"Part 1\" article cited here (with this specific DOI) could not be located or confirmed to exist. Treat as unconfirmed.",
    text: "Attachaipanich, T. et al. (2026) 'Precision Medicine for Anticoagulation Strategies in the Cath Lab: Part 1', Curr Cardiol Rep 28(1).",
    url: "https://doi.org/10.1007/s11886-026-02388-y"
  },
  {
    id: 103,
    kind: "Letter raising concerns about generic enoxaparin use in ACS without clinical data; independently verified via the publisher's own page, matching the claim made from it.",
    text: "Gomes, M. et al. (2010) 'Concerns on generic enoxaparin use in acute coronary syndrome', Arq Bras Cardiol 95(4): 551-2.",
    url: "https://doi.org/10.1590/s0066-782x2010001400022"
  },
  {
    id: 104,
    kind: "Review of enoxaparin pharmacology in non-surgical patients; independently verified.",
    text: "Imbalzano, E. et al. (2024) 'Update on the Pharmacological Actions of Enoxaparin in Nonsurgical Patients', Medicina (Kaunas) 60(1).",
    url: "https://doi.org/10.3390/medicina60010156"
  }
];

const NODES = [
  {
    id: "trigger",
    type: "process",
    label: "Adult with unstable angina or NSTEMI",
    sub: "Aspirin + P2Y12 inhibitor started\nAssess ischaemic and bleeding risk (e.g., CRUSADE score)",
    meaning: "The starting point for this algorithm: a patient with non-ST-elevation acute coronary syndrome (NSTE-ACS) — unstable angina or NSTEMI — who has already been started on dual antiplatelet therapy and is now being assessed for a parenteral anticoagulant alongside it.",
    rationale: "Parenteral anticoagulation added to antiplatelet therapy is a core, guideline-recommended component of initial NSTE-ACS management, reducing early ischaemic events on top of aspirin alone. Formal bleeding-risk scoring such as the CRUSADE score at this point helps balance that ischaemic benefit against the bleeding risk the chosen anticoagulant and its dose will carry.",
    refs: [1, 2, 3, 97]
  },
  {
    id: "angio_24h",
    type: "decision",
    label: "Invasive angiography planned within 24 hours?",
    meaning: "The anticoagulant choice in current guidelines turns on management strategy: whether the patient is going for early invasive angiography (within 24 hours) or being managed with a more conservative, delayed-or-no-angiography approach.",
    rationale: "Current European and American guidance frames the anticoagulant choice around this same branch point — unfractionated heparin for patients proceeding to early invasive management, fondaparinux (or, if unavailable, an LMWH) when early angiography is not planned — reflecting each agent's practical fit with the periprocedural setting rather than a difference in NSTE-ACS-specific trial evidence between the two strategies themselves.",
    refs: [1, 2, 3]
  },
  {
    id: "ufh_preferred",
    type: "terminal",
    label: "Unfractionated heparin preferred",
    sub: "60–70 IU/kg IV bolus (max 5,000 IU), then 12–15 IU/kg/h (aPTT 1.5–2.5 × control); 70–100 IU/kg at PCI\nIf already on SC enoxaparin: continue it through PCI; do not switch",
    dose: [
      ["IV bolus", "60–70 IU/kg (max 5,000 IU)"],
      ["Infusion", "12–15 IU/kg/h, titrated to aPTT 1.5–2.5 × control"],
      ["At PCI", "70–100 IU/kg"]
    ],
    meaning: "When early invasive management is planned, unfractionated heparin (UFH) — not an LMWH — is the preferred anticoagulant, dosed and monitored to a weight-based bolus/infusion regimen with aPTT targets, plus a separate weight-based bolus at the time of PCI itself.",
    rationale: "UFH's short half-life and reversibility fit the periprocedural setting, and current guidelines name it the preferred agent when angiography is imminent. The 'do not switch' instruction reflects this review's own synthesis and direct trial evidence: in the SYNERGY PCI substudy, crossing over between anticoagulants during the same admission sharply increased bleeding in both directions, which is part of why switching between UFH and an LMWH — or between LMWHs — during one admission is specifically discouraged throughout this algorithm.",
    cautions: [
      "If a patient is already established on subcutaneous enoxaparin, continuing it through PCI rather than switching to UFH avoids exactly the crossover-related bleeding increase described above."
    ],
    refs: [1, 2, 3, 69]
  },
  {
    id: "fonda_preferred",
    type: "process",
    label: "Fondaparinux preferred",
    sub: "2.5 mg SC once daily (lowest bleeding risk vs enoxaparin)\nIf unavailable or not chosen: use an LMWH (below)",
    dose: [
      ["Fondaparinux", "2.5 mg SC once daily"]
    ],
    meaning: "When early invasive management is not planned, fondaparinux is the preferred anticoagulant — a fixed-dose, once-daily factor Xa inhibitor with the lowest bleeding risk of any agent compared head-to-head with enoxaparin in a large trial. Where fondaparinux is unavailable or not chosen, an LMWH is the fallback, which is what the rest of this algorithm addresses.",
    rationale: "In OASIS-5, fondaparinux was non-inferior to enoxaparin for the ischaemic composite at 9 days and nearly halved major bleeding (2.2% vs 4.1%); subsequent meta-analyses have confirmed the lower-bleeding finding at every time point measured. This is the single strongest, most consistent piece of comparative evidence anywhere in this algorithm — considerably more robust than the LMWH-vs-LMWH evidence that follows below.",
    refs: [78, 79, 80, 81, 2, 3]
  },
  {
    id: "lmwh_priority",
    type: "process",
    tone: "key",
    label: "If an LMWH is used, prefer the agent with most outcome data; use each agent only at its own tested regimen",
    meaning: "This is the central practical conclusion of the systematic review this algorithm is built from: among enoxaparin, nadroparin and dalteparin, choose the one with the most outcome data behind it, and whichever is used, give it at its own specific, independently validated dose — never at another agent's dose.",
    rationale: "The review found no randomised evidence of a clinically important difference among the three LMWHs in unstable angina or NSTEMI, but the trials comparing them head-to-head were few, small and mostly at high risk of bias — nowhere near large enough to prove the agents are equivalent either. Absence of proven difference is not evidence of interchangeability: the pooled enoxaparin-vs-dalteparin confidence interval alone spans from a moderate benefit of enoxaparin to a real deficit, and the three agents differ pharmacologically (manufacturing process, molecular weight, anti-Xa:anti-IIa ratio) in ways that plausibly matter clinically even without trial proof yet.",
    refs: [14, 19, 23, 24]
  },
  {
    id: "enox_first",
    type: "process",
    tone: "key",
    label: "First choice",
    sub: "Enoxaparin\n1 mg/kg SC every 12 h\nLargest RCT evidence and only LMWH named in ESC/ACC-AHA guidance",
    dose: [
      ["Enoxaparin", "1 mg/kg SC every 12 h"]
    ],
    meaning: "Enoxaparin is the default LMWH choice: the only one of the three with a large, modern randomised trial programme behind it, and the only one specifically named in current European and American NSTE-ACS guidelines.",
    rationale: "Enoxaparin was superior to UFH in its pivotal trials and, across a systematic overview of six trials and nearly 22,000 patients, reduced 30-day death or MI (OR 0.91) without a significant increase in major bleeding or transfusion. A larger 12-trial, roughly 49,000-patient meta-analysis found the same ischaemic benefit at the cost of more major bleeding, with net clinical benefit neutral in NSTE-ACS specifically (as opposed to the full acute coronary syndrome spectrum, where it was clearly favourable). No comparable trial programme exists for dalteparin or nadroparin, which is the main reason current guidelines name enoxaparin specifically.",
    refs: [1, 2, 3, 23, 24]
  },
  {
    id: "dalt_alt",
    type: "process",
    label: "Alternative",
    sub: "Dalteparin\n120 IU/kg SC every 12 h (max 10,000 IU)\nNo proven difference vs enoxaparin",
    dose: [
      ["Dalteparin", "120 IU/kg SC every 12 h (max 10,000 IU)"]
    ],
    meaning: "Dalteparin, at its own weight-based dose, is an acceptable alternative where formulary or availability constraints require it — not because it has been shown equivalent to enoxaparin, but because no head-to-head trial has shown it to be worse.",
    rationale: "Three small trials compared enoxaparin with dalteparin directly; pooling the two with comparable composite endpoints gave an odds ratio of 0.74 (95% CI 0.37–1.47) — favouring enoxaparin numerically but falling short of a clinically important difference, with a confidence interval wide enough to be compatible with either agent being meaningfully better. No trial found a significant difference in bleeding between the two. This genuinely is 'no proven difference' rather than 'proven equivalence' — the distinction the whole algorithm is built around.",
    refs: [59, 60, 64]
  },
  {
    id: "nadro_alt",
    type: "process",
    label: "Alternative",
    sub: "Nadroparin\n86 IU/kg SC every 12 h\nLower early anti-Xa than enoxaparin; ask about prior heparin skin reactions",
    dose: [
      ["Nadroparin", "86 IU/kg SC every 12 h"]
    ],
    meaning: "Nadroparin, at its own weight-based dose, is the second alternative — again not proven equivalent to enoxaparin, and with one real pharmacodynamic difference worth knowing about: it produces measurably lower early anticoagulant activity at its recommended dose.",
    rationale: "In a small pharmacodynamic trial, mean anti-Xa activity 3 hours after the first dose was more than twice as high with enoxaparin as with nadroparin (0.65 vs 0.30 IU/mL), and the therapeutic target was reached in 66.7% of enoxaparin-treated versus only 10.0% of nadroparin-treated patients. This shows the two agents produce different early pharmacodynamic profiles at their respective recommended doses — evidence against treating them as interchangeable — but because clinical outcomes were not reported in that trial, it cannot by itself prove a difference in clinical efficacy. A separate trial of enoxaparin and nadroparin, both given alongside tirofiban, found similar in-hospital major adverse cardiac events (19% vs 15%, OR 1.30, 95% CI 0.37–4.60) — again a wide, inconclusive interval, not evidence of equivalence.",
    cautions: [
      "Nadroparin carries by far the highest reported risk of heparin-induced delayed-type cutaneous hypersensitivity among the anticoagulants compared in pooled safety data (odds ratio 30.2) — worth asking about before choosing it, even though this is a non-haemorrhagic safety signal rather than an efficacy difference."
    ],
    refs: [61, 63, 44]
  },
  {
    id: "renal_check",
    type: "process",
    tone: "key",
    label: "Check renal function (CrCl) and body weight; recalculate dose (never unit-for-unit)",
    meaning: "Before continuing any LMWH, renal function and body weight need to be checked and the dose recalculated for that specific agent — never simply carried over milligram-for-milligram or unit-for-unit from another LMWH, or left at a standard dose that hasn't been adjusted for this patient.",
    rationale: "All three LMWHs are cleared predominantly by the kidney, and dose-related bleeding risk in renal impairment is best documented for enoxaparin specifically. In a population pharmacokinetic study, enoxaparin clearance fell with declining creatinine clearance and patients with low clearance had a 3.8-fold higher risk of major haemorrhage; a separate meta-analysis confirmed higher anti-Xa levels and more major bleeding with unadjusted therapeutic-dose enoxaparin in severe renal impairment, while data for dalteparin in the same setting were explicitly insufficient to draw conclusions. In real-world practice this step is often skipped: a national survey found LMWH doses were not adjusted for renal failure in 71% of hospitals.",
    refs: [35, 37, 39, 40, 43, 18]
  },
  {
    id: "crcl_mid",
    type: "process",
    label: "CrCl 15-29 mL/min",
    sub: "Enoxaparin 1 mg/kg SC once daily; other LMWHs: reduce dose per product label",
    dose: [
      ["Enoxaparin (CrCl 15–29 mL/min)", "1 mg/kg SC once daily"]
    ],
    meaning: "In moderate-to-severe renal impairment, enoxaparin's dose interval changes from twice daily to once daily at the same per-kilogram dose; dalteparin and nadroparin should likewise be reduced from their standard regimen, following their own product labelling rather than enoxaparin's once-daily rule.",
    rationale: "This step-down reflects the accumulation risk documented for enoxaparin at full twice-daily dosing as renal function falls, and the general principle — repeated throughout this algorithm — that each LMWH's renal dose adjustment has to be looked up for that specific agent rather than inferred from another one's label.",
    refs: [35, 37, 39]
  },
  {
    id: "crcl_low",
    type: "process",
    tone: "alarm",
    label: "CrCl <15 mL/min",
    sub: "or dialysis: use UFH with aPTT monitoring; avoid LMWHs",
    meaning: "Below a creatinine clearance of 15 mL/min, or in a patient on dialysis, no LMWH dose adjustment is considered safe enough — the recommendation switches back to unfractionated heparin with aPTT monitoring, the same reversible, non-renally-cleared agent used for patients going for early angiography.",
    rationale: "Accumulation and bleeding risk in severe renal impairment are best documented for enoxaparin, where a meta-analysis found an excess of major bleeding with unadjusted therapeutic dosing; data for dalteparin and nadroparin in this setting are sparse rather than reassuring, which is part of why this algorithm does not attempt to offer a reduced LMWH dose at this level of renal function at all.",
    refs: [35, 43]
  },
  {
    id: "special_pop",
    type: "process",
    label: "Special populations",
    sub: "Weight >150 kg, frailty or unstable renal function: anti-Xa 3-4 h after dose (enoxaparin 0.5-1.2 IU/mL)",
    dose: [
      ["Anti-Xa target (enoxaparin), measured 3–4 h post-dose", "0.5–1.2 IU/mL"]
    ],
    meaning: "At the extremes of body weight, in frailty, or when renal function is changing from day to day, weight-based dosing formulas become less reliable — so anti-Xa level monitoring, rather than the dose formula alone, is used to confirm the patient is actually in a safe and effective range.",
    rationale: "Enoxaparin dosing by actual body weight appears appropriate up to moderate obesity, and a SYNERGY substudy and a recent meta-analysis both found obesity did not meaningfully change enoxaparin's efficacy or bleeding risk — but these reassuring findings come from studies of obesity alone, not the combination of obesity with renal impairment or genuine frailty that this box is aimed at, where monitoring rather than formula-trust is the more cautious approach.",
    refs: [39, 94, 95]
  },
  {
    id: "all_patients",
    type: "terminal",
    label: "All patients",
    sub: "Continue until revascularisation or discharge (maximum about 8 days); stop after uncomplicated PCI.\nAvoid switching between UFH and LMWH, or between LMWHs, during the same admission.\nDouble-check weight-based doses: excess dosing accounts for a substantial share of major bleeding.",
    meaning: "Three rules apply regardless of which anticoagulant pathway was taken: there is a natural stopping point (revascularisation, discharge, or roughly 8 days, whichever comes first, and earlier still after an uncomplicated PCI), the chosen agent should not be swapped for a different one mid-admission, and every weight-based dose is worth double-checking before it is given.",
    rationale: "The 'no switching' rule is grounded directly in trial evidence: the SYNERGY PCI substudy showed bleeding rose sharply in both directions whenever patients crossed over between anticoagulants. The dosing-error warning is grounded just as directly: in a large North American registry, excess dosing of antithrombotic agents — more common in older patients, women, and those with renal insufficiency — was estimated to account for 15% of major bleeding in that population, a preventable share of harm that has nothing to do with which anticoagulant was chosen in the first place.",
    refs: [69, 96, 100]
  }
];

const GLOSSARY = [
  {
    match: "anti-Xa",
    full: "anti-factor Xa activity",
    def: "A laboratory measure of how strongly a heparin-based anticoagulant is inhibiting factor Xa, used both as a dosing target (particularly for enoxaparin) and, in some of the trials behind this algorithm, as a pharmacodynamic trial endpoint in its own right."
  },
  {
    match: "major adverse cardiac events",
    full: "MACE",
    def: "A composite outcome combining death, myocardial infarction, and other serious cardiac events, used as a trial endpoint in several of the head-to-head LMWH comparisons behind this algorithm."
  },
  {
    match: "CRUSADE score",
    def: "A validated bleeding-risk score for NSTE-ACS, derived and validated in a registry of nearly 18,000 patients, used to estimate a patient's baseline risk of major in-hospital bleeding before an anticoagulant is chosen."
  },
  {
    match: "NSTE-ACS",
    full: "non-ST-elevation acute coronary syndrome",
    def: "The umbrella term for unstable angina and non-ST-elevation myocardial infarction (NSTEMI) together — acute coronary syndromes that, unlike STEMI, do not show ST-segment elevation on the presenting ECG."
  },
  {
    match: "clinically important difference",
    def: "Shorthand, throughout this algorithm, for a difference judged large enough to matter to patients — operationalised in the review behind this tool as a standardised effect size (Cohen's d) of at least 0.20. A result can fail to reach this threshold, fall short of it, or have a confidence interval too wide to rule it in or out, all of which are different from the two agents being proven equivalent."
  }
];
