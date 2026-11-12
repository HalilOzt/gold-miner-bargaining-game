(function () {
  "use strict";

  const papers = [
    { id: "02", year: 2021, theme: "Structural & policy", title: "Structural Empirical Analysis of Contracting in Vertical Markets", authors: "Robin S. Lee, Michael D. Whinston & Ali Yurukoglu", method: "Handbook survey", finding: "A guide to how applied industrial-organization research uses bargaining models—and how disagreement payoffs, conduct, and contract form shape counterfactuals.", url: "https://www.nber.org/papers/w29282" },
    { id: "03", year: 1989, theme: "Lab experiments", title: "An Experimental Study of Sequential Bargaining", authors: "Jack Ochs & Alvin E. Roth", method: "Laboratory experiment", finding: "First-mover advantage appears, but monetary-payoff subgame perfection has weak point-predictive power for observed offers and rejections.", url: "https://stanford.edu/~alroth/papers/1989_AER_An_Experimental_Study.pdf" },
    { id: "04", year: 1988, theme: "Lab experiments", title: "The Deadline Effect in Bargaining", authors: "Alvin E. Roth, J. Keith Murnighan & Françoise Schoumaker", method: "Laboratory experiment", finding: "Agreements cluster in the final seconds while meaningful disagreement remains, challenging simple accounts of timing and breakdown.", url: "https://stanford.edu/~alroth/papers/1988_AER_Deadline_Effect.pdf" },
    { id: "05", year: 1991, theme: "Lab experiments", title: "Bargaining and Market Behavior in Four Countries", authors: "Alvin E. Roth, Vesna Prasnikar, Masahiro Okuno-Fujiwara & Shmuel Zamir", method: "Multinational lab experiment", finding: "Competitive markets converge similarly across countries, while bilateral ultimatum outcomes differ and remain far from the self-interest benchmark.", url: "https://stanford.edu/~alroth/papers/1991_AER_Bargaining_and_Market_Behavior.pdf" },
    { id: "06", year: 1998, theme: "Lab experiments", title: "Learning in High-Stakes Ultimatum Games", authors: "Robert Slonim & Alvin E. Roth", method: "High-stakes lab experiment", finding: "Higher stakes modestly reduce rejection; with experience, proposers learn to make lower offers.", url: "https://stanford.edu/~alroth/papers/lihsug.pdf" },
    { id: "07", year: 2005, theme: "Lab experiments", title: "‘Economic Man’ in Cross-Cultural Perspective", authors: "Joseph Henrich et al.", method: "Lab-in-the-field", finding: "Self-interest predictions fail in 15 small-scale societies, with behavior varying alongside market integration and everyday cooperation.", url: "https://www2.psych.ubc.ca/~henrich/Website/Papers/BBSTarget2005.pdf" },
    { id: "08", year: 2007, theme: "Institutions & networks", title: "Bargaining and Network Structure: An Experiment", authors: "Gary Charness, Margarida Corominas-Bosch & Guillaume R. Fréchette", method: "Network experiment", finding: "Network position changes payoffs and can create spillovers for parties not directly connected by the altered link.", url: "https://faculty.econ.ucsb.edu/~charness/papers/network_bargaining.pdf" },
    { id: "09", year: 2003, theme: "Institutions & networks", title: "Bargaining in Legislatures: Open versus Closed Amendment Rules", authors: "Guillaume R. Fréchette, John H. Kagel & Steven F. Lehrer", method: "Committee experiment", finding: "Rule effects are qualitatively consistent with theory, but closed rules produce more minimal coalitions and allocations are more egalitarian than predicted.", url: "https://econ.queensu.ca/faculty/lehrer/bargleg.pdf" },
    { id: "10", year: 2005, theme: "Institutions & networks", title: "Nominal Bargaining Power, Selection Protocol, and Discounting", authors: "Guillaume R. Fréchette, John H. Kagel & Massimo Morelli", method: "Legislative experiment", finding: "Baron–Ferejohn comparative statics outperform simpler proportional rules, while proposer power and discounting effects are much weaker than point predictions.", url: "https://gfrechette.com/print/Frechette_2005b.pdf" },
    { id: "11", year: 2005, theme: "Institutions & networks", title: "Behavioral Identification in Coalitional Bargaining", authors: "Guillaume R. Fréchette, John H. Kagel & Massimo Morelli", method: "Coalitional experiment", finding: "Observed behavior is less sensitive to demand-versus-offer protocols than theory predicts, though comparative statics survive better than payoff levels.", url: "https://gfrechette.com/print/Frechette_2005c.pdf" },
    { id: "12", year: 2024, theme: "Communication & information", title: "Fairness Concerns Are Less Relevant When Agents Are Less Informed", authors: "Jennie Huang, Judd B. Kessler & Muriel Niederle", method: "Laboratory experiment", finding: "Removing information makes offers less generous and unequal offers more acceptable, showing that fairness estimates are information-dependent.", url: "https://users.nber.org/~kesslerj/papers/HuangKesslerNiederle_Fairness.pdf" },
    { id: "13", year: 2024, theme: "Institutions & networks", title: "Bargaining in the Shadow of Uncertainty", authors: "Marina Agranov, Hülya Eraslan & Chloe Tergiman", method: "Multilateral experiment", finding: "Unanimity can prevent premature agreement when delay is efficient; majority-rule deviations reflect egalitarian sharing and lower exclusion risk.", url: "https://www.aeaweb.org/content/file?id=21569" },
    { id: "14", year: 2017, theme: "Communication & information", title: "Information Transmission through Bargaining", authors: "Olivier Bochet & Simon Siegenthaler", method: "Adverse-selection experiment", finding: "Bargaining frictions and buyer competition can transmit quality information and restore trade in high-quality goods.", url: "https://www.aeaweb.org/conference/2018/preliminary/paper/Fy3Ny85e" },
    { id: "15", year: 2004, theme: "Communication & information", title: "Unilateral Face-to-Face Communication in Ultimatum Bargaining", authors: "Carsten Schmidt & Ro’i Zultan", method: "Video experiment", finding: "Bilateral communication raises cooperation more than one-way communication through both strategic content and social contact.", url: "https://ratio.huji.ac.il/files/dp369.pdf" },
    { id: "16", year: 2021, theme: "Communication & information", title: "Fairness in Incomplete-Information Bargaining", authors: "Daniel Keniston, Bradley J. Larsen, Shengwu Li, J.J. Prescott, Bernardo S. Silveira & Chuan Yu", method: "Seven field settings", finding: "Split-the-difference offers recur across cars, housing, injury claims, rickshaws, tariffs, television, and online retail.", url: "https://www.nber.org/papers/w29111" },
    { id: "17", year: 2020, theme: "Market bargaining", title: "Sequential Bargaining in the Field", authors: "Matthew Backus, Thomas Blake, Bradley Larsen & Steven Tadelis", method: "25 million eBay threads", finding: "Outside options matter, but gradual reciprocity, delayed disagreement, and exact halfway offers exceed standard complete-information explanations.", url: "https://faculty.haas.berkeley.edu/stadelis/sequentialbargaining.pdf" },
    { id: "18", year: 2020, theme: "Communication & information", title: "Communication and Bargaining Breakdown", authors: "Matthew Backus, Thomas Blake, Jett Pettus & Steven Tadelis", method: "Natural field experiment", finding: "Messaging reduces breakdown among affected eBay users, with gains emerging as sellers learn how to communicate.", url: "https://www.nber.org/papers/w27984" },
    { id: "19", year: 2019, theme: "Market bargaining", title: "The Efficiency of Real-World Bargaining", authors: "Bradley Larsen", method: "Structural bounds", finding: "Wholesale auto negotiations leave many mutually beneficial trades unrealized, destroying a material share of available surplus.", url: "https://www.nber.org/papers/w20431" },
    { id: "20", year: 2011, theme: "Market bargaining", title: "Bargaining and Welfare: A Dynamic Structural Analysis", authors: "Daniel E. Keniston", method: "Dynamic structural model", finding: "An optional fixed price can raise welfare for bargaining-averse buyers while retaining a flexible market for others.", url: "https://www.cemfi.es/ext/REStour/Keniston%20-%20Autorickshaws%2021Jan11.pdf" },
    { id: "21", year: 1995, theme: "Labor & discrimination", title: "Race and Gender Discrimination in Bargaining for a New Car", authors: "Ian Ayres & Peter Siegelman", method: "Paired audit experiment", finding: "Dealers quote lower prices to white men than to otherwise comparable Black or female testers using the same bargaining script.", url: "https://cpi.stanford.edu/_media/pdf/Reference%20Media/Ayres_Siegelman_1995_Discrimination.pdf" },
    { id: "22", year: 1995, theme: "Labor & discrimination", title: "Strikes and Wages: The Effect of Collective Bargaining Legislation", authors: "Peter C. Cramton, Morley Gunderson & Joseph S. Tracy", method: "Policy panel analysis", finding: "Replacement-worker bans are associated with higher wages and more or longer strikes, consistent with private-information bargaining.", url: "https://www.nber.org/papers/w5105" },
    { id: "23", year: 2005, theme: "Labor & discrimination", title: "The Effect of Firm-Level Contracts on the Structure of Wages", authors: "David Card & Sara de la Rica", method: "Matched employer–employee data", finding: "Firm-specific bargaining is associated with a wage premium that is larger toward the top of the wage distribution.", url: "https://www.nber.org/papers/w11829" },
    { id: "24", year: 2024, theme: "Labor & discrimination", title: "Bargaining in the Labor Market", authors: "Sydnee Caldwell, Ingrid Haegele & Jörg Heining", method: "Linked surveys and records", finding: "Individual wage bargaining is widespread—especially in tight markets and senior jobs—and contributes to within-firm inequality.", url: "https://cowles.yale.edu/sites/default/files/2024-05/Caldwell-chh_bargain.pdf" },
    { id: "25", year: 2006, theme: "Household bargaining", title: "Determinants and Consequences of Bargaining Power in Households", authors: "Leora Friedberg & Anthony Webb", method: "Survey-linked outcomes", finding: "Directly reported final-say power predicts portfolio choice and wealth accumulation more strongly than earnings alone.", url: "https://www.nber.org/papers/w12367" },
    { id: "26", year: 1997, theme: "Household bargaining", title: "Do Husbands and Wives Pool Their Resources?", authors: "Shelly J. Lundberg, Robert A. Pollak & Terence J. Wales", method: "Natural experiment", finding: "Paying child benefit to wives shifts household spending, rejecting complete income pooling.", url: "https://sjlundberg.weebly.com/uploads/1/1/0/0/110062333/uk_jhr_1997.pdf" },
    { id: "27", year: 2019, theme: "Household bargaining", title: "Point Estimates of Household Bargaining Power Using Outside Options", authors: "Matthew J. Klein & Bradford L. Barham", method: "Structural estimation", finding: "A transfer program sharply increases estimated maternal power, with empowerment improving household diet.", url: "https://api.aae.wisc.edu/pubs/pdf/sps/stpap590.pdf" },
    { id: "28", year: 2012, theme: "Household bargaining", title: "Collective Consumption Models with Restricted Bargaining Weights", authors: "Sabrina Bruyneel, Laurens Cherchye & Bram De Rock", method: "Consumption experiment", finding: "Pareto-efficient collective choice fits best when bargaining weights may move, but only within limits.", url: "https://doi.org/10.1007/s11150-011-9125-6" },
    { id: "29", year: 2013, theme: "Structural & policy", title: "Insurer Competition and Negotiated Hospital Prices", authors: "Kate Ho & Robin S. Lee", method: "Claims data and model", finding: "More insurer competition lowers prices on average, but must-have hospitals can benefit when consumers switch insurers to retain access.", url: "https://www.nber.org/papers/w19401" },
    { id: "30", year: 2014, theme: "Foundations", title: "Bargaining in Bilateral Oligopoly", authors: "Allan Collard-Wexler, Gautam Gowrisankaran & Robin S. Lee", method: "Noncooperative theory", finding: "Provides an alternating-offers foundation for the Nash-in-Nash solution widely used in empirical industrial organization.", url: "https://www.nber.org/papers/w20641" },
    { id: "31", year: 2012, theme: "Structural & policy", title: "Bargaining with Asymmetric Information: Plea Negotiations", authors: "Bernardo S. da Silveira", method: "Nonparametric estimation", finding: "Plea sentences respond to trial outcomes, so sentencing reforms feed back through who settles and on what terms.", url: "https://www.hss.caltech.edu/~mshum/reading/Silveira2012.pdf" },
    { id: "32", year: 2025, theme: "Market bargaining", title: "How Well Does Bargaining Work in Consumer Markets?", authors: "Joachim Freyberger & Bradley Larsen", method: "Partial identification", finding: "Under weak behavioral assumptions, inefficient impasse remains large in online consumer bargaining.", url: "https://www.nber.org/papers/w29202" },
    { id: "33", year: 2025, theme: "Labor & discrimination", title: "Anticipated Discrimination and Wage Negotiation", authors: "Gary Charness, Ramón Cobo-Reyes, Santiago García-Couto, Simone Meraglia & Ángela Sánchez", method: "Randomized field experiment", finding: "Concealing gender and emphasizing merit substantially narrow the gender gap in requested wages.", url: "https://osf.io/download/69316b86dbdb6000e6381f3e/" },
    { id: "34", year: 2022, theme: "Market bargaining", title: "Price Discrimination by Negotiation", authors: "David P. Byrne, Leslie A. Martin & Jia Sheen Nah", method: "Audit field experiment", finding: "Retail electricity firms condition discounts on perceived reference-price knowledge and switching costs.", url: "https://doi.org/10.1093/qje/qjac012" },
    { id: "EK1", year: 2026, theme: "Communication & information", title: "Costly Argumentation in Bargaining", authors: "Emin Karagözoğlu, Kerim Keskin & Deren Çağlayan", method: "Bargaining theory", finding: "When offers require justification, proposers trade off costly argument provision against more generous offers; sufficiently low argument costs support positive argumentation in equilibrium.", url: "https://doi.org/10.1016/j.jebo.2025.107353" },
    { id: "EK2", year: 2025, theme: "Lab experiments", title: "Earned Entitlements and Risky Investments in Bargaining", authors: "Mürüvvet Büyükboyacı, Emin Karagözoğlu & Serkan Küçükşenel", method: "Laboratory experiment", finding: "Low contributors who take a risk are punished for failure and rewarded for success, while high contributors receive comparatively stable shares across outcomes.", url: "https://doi.org/10.1017/eec.2026.10047" },
    { id: "EK3", year: 2025, theme: "Foundations", title: "Using Ultimatum Power as a Leverage in Resolving a Bargaining Conflict", authors: "Emin Karagözoğlu & Kerim Keskin", method: "Mechanism design theory", finding: "A two-stage protocol that assigns ultimatum power to the less greedy party can implement a targeted division while preserving gradualism and procedural fairness.", url: "https://doi.org/10.1007/s00182-025-00956-0" },
    { id: "EK4", year: 2024, theme: "Foundations", title: "Consideration Sets and Reference Points in a Dynamic Bargaining Game", authors: "Emin Karagözoğlu & Kerim Keskin", method: "Dynamic bargaining theory", finding: "Limited consideration and reference points shaped by rejected offers can generate delay and even disagreement without asymmetric or incomplete information.", url: "https://doi.org/10.1016/j.jebo.2024.01.031" },
    { id: "EK5", year: 2019, theme: "Lab experiments", title: "Bargaining under Time Pressure from Deadlines", authors: "Emin Karagözoğlu & Martin G. Kocher", method: "Deadline experiment", finding: "Tighter deadlines increase disagreement and reduce equal-split agreements, especially when the parties begin with more distant proposals.", url: "https://doi.org/10.1007/s10683-018-9579-y" },
    { id: "EK6", year: 2016, theme: "Lab experiments", title: "On the Influence of Hard Leverage in a Soft Leverage Bargaining Game", authors: "Gary E. Bolton & Emin Karagözoğlu", method: "Rich-context experiment", finding: "Binding commitment mainly changes concessions, while focal claims shape opening offers; hard leverage helps its holder but settlements stay between the competing focal points.", url: "https://doi.org/10.1016/j.geb.2016.08.005" },
    { id: "EK7", year: 2015, theme: "Communication & information", title: "Performance Information, Production Uncertainty, and Subjective Entitlements", authors: "Emin Karagözoğlu & Arno Riedl", method: "Production-and-bargaining experiment", finding: "Performance information creates stronger, mutually inconsistent entitlements that alter proposals, concessions, duration, and negotiated shares.", url: "https://doi.org/10.1287/mnsc.2014.2012" }
  ];

  const pages = [...document.querySelectorAll("[data-page]")];
  const navLinks = [...document.querySelectorAll("[data-page-link]")];
  const validPages = new Set(pages.map((page) => page.dataset.page));

  function openPage(name, updateHash) {
    const pageName = validPages.has(name) ? name : "overview";
    pages.forEach((page) => { page.hidden = page.dataset.page !== pageName; });
    navLinks.forEach((link) => {
      const active = link.dataset.pageLink === pageName;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    document.body.dataset.currentPage = pageName;
    if (updateHash && location.hash !== `#${pageName}`) history.pushState(null, "", `#${pageName}`);
    window.scrollTo({ top: 0, behavior: "auto" });
    window.dispatchEvent(new CustomEvent("bargaining:page", { detail: { active: pageName === "game" } }));
    if (pageName === "game") window.dispatchEvent(new CustomEvent("bargaining:open-game"));
  }

  document.addEventListener("click", (event) => {
    const pageControl = event.target.closest("[data-open-page], [data-page-link]");
    if (!pageControl) return;
    event.preventDefault();
    openPage(pageControl.dataset.openPage || pageControl.dataset.pageLink, true);
  });
  window.addEventListener("hashchange", () => openPage(location.hash.slice(1), false));

  const themes = ["All", ...new Set(papers.map((paper) => paper.theme))];
  const filterContainer = document.getElementById("paperFilters");
  const paperGrid = document.getElementById("paperGrid");
  const searchInput = document.getElementById("paperSearch");
  const countLabel = document.getElementById("catalogCount");
  const emptyState = document.getElementById("catalogEmpty");
  const clearButton = document.getElementById("clearFilters");
  let activeTheme = "All";

  themes.forEach((theme) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = theme;
    button.dataset.theme = theme;
    button.className = theme === "All" ? "active" : "";
    button.setAttribute("aria-pressed", theme === "All" ? "true" : "false");
    filterContainer.appendChild(button);
  });

  function renderPapers() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const results = papers.filter((paper) => {
      const themeMatch = activeTheme === "All" || paper.theme === activeTheme;
      const textMatch = !query || `${paper.title} ${paper.authors} ${paper.method} ${paper.finding} ${paper.year} ${paper.theme}`.toLocaleLowerCase().includes(query);
      return themeMatch && textMatch;
    });

    paperGrid.innerHTML = results.map((paper) => `
      <article class="paper-card">
        <div class="paper-meta"><span>${paper.theme}</span><time>${paper.year}</time></div>
        <h2>${paper.title}</h2>
        <p class="paper-authors">${paper.authors}</p>
        <p class="paper-finding">${paper.finding}</p>
        <div class="paper-footer"><span>${paper.method}</span><a href="${paper.url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${paper.title}">Open paper <b aria-hidden="true">↗</b></a></div>
      </article>`).join("");

    countLabel.textContent = `${results.length} ${results.length === 1 ? "paper" : "papers"}`;
    emptyState.hidden = results.length !== 0;
    clearButton.hidden = activeTheme === "All" && !query;
  }

  filterContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-theme]");
    if (!button) return;
    activeTheme = button.dataset.theme;
    [...filterContainer.children].forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", active ? "true" : "false");
    });
    renderPapers();
  });
  searchInput.addEventListener("input", renderPapers);
  clearButton.addEventListener("click", () => {
    activeTheme = "All";
    searchInput.value = "";
    filterContainer.querySelector('[data-theme="All"]').click();
    searchInput.focus();
  });

  renderPapers();
  openPage(location.hash.slice(1) || "overview", false);
})();
