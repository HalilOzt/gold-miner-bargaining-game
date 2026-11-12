(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const $ = (id) => document.getElementById(id);
  const ui = {
    p1Bank: $("p1Bank"), p2Bank: $("p2Bank"), p1Round: $("p1Round"), p2Round: $("p2Round"),
    phase: $("phaseLabel"), round: $("roundLabel"), timer: $("timerLabel"), timerFill: $("timerFill"),
    contractStrip: $("contractStrip"), contractText: $("contractText"), contractDetail: $("contractDetail"),
    countdown: $("countdown"), countdownText: $("countdownText"), bargainPanel: $("bargainPanel"),
    setupPanel: $("setupPanel"), setupTimer: $("setupTimerSlider"), setupTimerValue: $("setupTimerValue"),
    bargainTimer: $("bargainTimer"), bargainTitle: $("bargainTitle"), slider: $("offerSlider"),
    p1OfferBar: $("p1OfferBar"), p2OfferBar: $("p2OfferBar"), p1OfferValue: $("p1OfferValue"), p2OfferValue: $("p2OfferValue"),
    proposalActions: $("proposalActions"), responseActions: $("responseActions"), offerLog: $("offerLog"),
    mechanism: $("mechanismSelect"), mechanismNote: $("mechanismNote"), panelCopy: $("panelCopy"),
    makeOffer: $("makeOfferBtn"), accept: $("acceptBtn"), counter: $("counterBtn"), quickOffers: document.querySelector(".quick-offers"),
    resultPanel: $("resultPanel"), resultKicker: $("resultKicker"), resultTitle: $("resultTitle"),
    p1Payout: $("p1Payout"), p2Payout: $("p2Payout"), resultExplanation: $("resultExplanation"),
    nextRound: $("nextRoundBtn"), finalPanel: $("finalPanel"), winnerTitle: $("winnerTitle"), winnerDetail: $("winnerDetail"),
    mineTip: $("mineTip")
  };

  const state = {
    phase: "ready",
    round: 1,
    maxRounds: 4,
    bank: [0, 0],
    haul: [0, 0],
    contract: null,
    bargainSeconds: 20,
    mineSeconds: 38,
    remaining: 0,
    proposer: 0,
    turn: 0,
    awaitingResponse: false,
    pendingOffer: null,
    offers: [],
    mechanism: "alternating",
    claims: [null, null],
    agreementMultiplier: 1.10,
    messages: [],
    lastTime: performance.now(),
    objects: [],
    particles: [],
    muted: false,
    animationId: null,
    started: false,
    pageActive: document.body.dataset.currentPage === "game"
  };

  const hooks = [
    makeHook(265, 74, "#ba4d2d", -0.82),
    makeHook(735, 74, "#28a19c", 0.82)
  ];

  function makeHook(x, y, color, direction) {
    return {
      x, y, color, direction,
      angle: Math.PI / 2 + direction * 0.35,
      minAngle: Math.PI * 0.22,
      maxAngle: Math.PI * 0.78,
      swingSpeed: 0.82,
      length: 54,
      state: "swing",
      maxLength: 590,
      extendSpeed: 460,
      retractSpeed: 350,
      held: null,
      dynamite: 2
    };
  }

  const types = {
    gem: { value: 650, radius: 14, weight: 0.8, color: "#27d6cf", label: "GEM" },
    goldSmall: { value: 80, radius: 15, weight: 1.0, color: "#f4bc2b", label: "$80" },
    goldMedium: { value: 220, radius: 25, weight: 1.8, color: "#eeb12a", label: "$220" },
    goldLarge: { value: 500, radius: 38, weight: 3.1, color: "#d99b1d", label: "$500" },
    rockSmall: { value: 15, radius: 18, weight: 2.7, color: "#81756b", label: "$15" },
    rockLarge: { value: 35, radius: 32, weight: 4.1, color: "#6e635a", label: "$35" }
  };

  const mechanisms = {
    alternating: {
      name: "Alternating offers",
      note: "Offer, reject, and counter until agreement or timeout.",
      copy: "Divide the shared pool. Rejection passes proposal power to the other miner."
    },
    ultimatum: {
      name: "Take-it-or-leave-it",
      note: "One proposal only. The responder must accept or trigger no deal.",
      copy: "The round's proposer has one chance to divide the shared pool."
    },
    demand: {
      name: "Simultaneous claims",
      note: "Both claims stay sealed. If they total over 100%, talks collapse.",
      copy: "Each miner privately claims a share. Compatible claims settle; any slack is split equally."
    },
    deadline: {
      name: "Deadline bargaining",
      note: "The cooperation bonus starts at 20% and falls toward 0% as time passes.",
      copy: "Counteroffers are allowed, but delay steadily shrinks the extra surplus."
    },
    midpoint: {
      name: "Meet halfway",
      note: "Both miners seal an anchor; the contract uses the midpoint between their positions.",
      copy: "Claim the share you think you deserve. The field-inspired rule splits the difference."
    }
  };

  function money(n) { return "$" + Math.round(n).toLocaleString(); }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function seededNoise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + state.round * 4.1) * 43758.5453;
    return n - Math.floor(n);
  }

  function resetHook(hook, index) {
    const fresh = makeHook(hook.x, hook.y, hook.color, index === 0 ? -0.82 : 0.82);
    hook.angle = fresh.angle;
    hook.length = fresh.length;
    hook.state = "swing";
    hook.held = null;
    hook.dynamite = 2;
  }

  function showSetup(resetScores) {
    state.phase = "ready";
    state.started = false;
    state.remaining = 0;
    if (resetScores) {
      state.round = 1;
      state.bank = [0, 0];
      state.haul = [0, 0];
      state.contract = null;
      state.objects = [];
      state.particles = [];
      hooks.forEach(resetHook);
      generateObjects();
    }
    ui.bargainPanel.hidden = true;
    ui.finalPanel.hidden = true;
    ui.resultPanel.hidden = true;
    ui.countdown.hidden = true;
    ui.setupPanel.hidden = false;
    ui.contractStrip.className = "contract-strip";
    ui.contractText.textContent = "Match not started";
    ui.contractDetail.textContent = "Choose a contract-table timer, then start the match.";
    updateScore();
  }

  function beginMatch() {
    if (state.started) return;
    state.bargainSeconds = clamp(Number(ui.setupTimer.value), 10, 60);
    state.started = true;
    ui.setupPanel.hidden = true;
    startBargaining();
  }

  function resetMatch() { showSetup(true); }

  function startBargaining() {
    state.phase = "bargain";
    state.contract = null;
    state.haul = [0, 0];
    state.mechanism = ui.mechanism.value;
    state.proposer = (state.round - 1) % 2;
    state.turn = state.proposer;
    state.awaitingResponse = false;
    state.pendingOffer = null;
    state.offers = [];
    state.claims = [null, null];
    state.messages = [];
    state.agreementMultiplier = state.mechanism === "deadline" ? 1.20 : 1.10;
    state.remaining = state.bargainSeconds;
    ui.resultPanel.hidden = true;
    ui.finalPanel.hidden = true;
    ui.setupPanel.hidden = true;
    ui.bargainPanel.hidden = false;
    ui.contractStrip.className = "contract-strip";
    ui.contractText.textContent = mechanisms[state.mechanism].name;
    ui.contractDetail.textContent = "Agreement creates a cooperation bonus. No deal triggers a 15% conflict tax.";
    ui.offerLog.textContent = "No offers yet.";
    ui.slider.value = "50";
    setOfferVisual(50);
    configureBargainingUI();
    setProposalMode();
    updateScore();
    playTone(330, .09, "triangle");
  }

  function setOfferVisual(p1Share) {
    const p1 = clamp(Number(p1Share), 20, 80);
    const p2 = 100 - p1;
    ui.p1OfferBar.style.width = p1 + "%";
    ui.p2OfferBar.style.width = p2 + "%";
    ui.p1OfferValue.textContent = p1 + "%";
    ui.p2OfferValue.textContent = p2 + "%";
  }

  function setClaimVisual(player, selfShare) {
    setOfferVisual(player === 0 ? selfShare : 100 - selfShare);
  }

  function configureBargainingUI() {
    const mode = mechanisms[state.mechanism];
    const claimMode = state.mechanism === "demand" || state.mechanism === "midpoint";
    ui.mechanismNote.textContent = mode.note;
    ui.panelCopy.textContent = mode.copy;
    ui.counter.hidden = state.mechanism === "ultimatum";
    const quickButtons = [...ui.quickOffers.querySelectorAll("button")];
    if (claimMode) {
      quickButtons[0].textContent = "Claim 40%";
      quickButtons[1].textContent = "Claim 50%";
      quickButtons[2].textContent = "Claim 60%";
    } else {
      quickButtons[0].textContent = "P1 40 / 60 P2";
      quickButtons[1].textContent = "Split evenly";
      quickButtons[2].textContent = "P1 60 / 40 P2";
    }
  }

  function setProposalMode() {
    state.awaitingResponse = false;
    ui.proposalActions.hidden = false;
    ui.responseActions.hidden = true;
    ui.slider.disabled = false;
    ui.mechanism.disabled = state.offers.length > 0 || state.claims.some((claim) => claim !== null);
    const claimMode = state.mechanism === "demand" || state.mechanism === "midpoint";
    if (claimMode) {
      ui.bargainTitle.textContent = `Player ${state.turn + 1}, seal your claim`;
      ui.makeOffer.textContent = "Lock claim";
      ui.slider.value = "50";
      setClaimVisual(state.turn, ui.slider.value);
    } else {
      ui.bargainTitle.textContent = `Player ${state.turn + 1} proposes`;
      ui.makeOffer.textContent = state.mechanism === "ultimatum" ? "Make final offer" : "Make offer";
      if (state.pendingOffer !== null) ui.slider.value = String(state.pendingOffer);
      setOfferVisual(ui.slider.value);
    }
  }

  function setResponseMode() {
    state.awaitingResponse = true;
    ui.proposalActions.hidden = true;
    ui.responseActions.hidden = false;
    ui.slider.disabled = true;
    ui.mechanism.disabled = true;
    const responder = 1 - state.turn;
    ui.bargainTitle.textContent = state.mechanism === "ultimatum"
      ? `Player ${responder + 1}, accept or reject?`
      : `Player ${responder + 1}, accept or counter?`;
  }

  function refreshOfferLog() {
    const offers = state.offers.map((o) => `P${o.by + 1}: ${o.p1Share}/${100 - o.p1Share}`);
    const messages = state.messages.map((m) => `P${m.by + 1} says “${m.text}”`);
    ui.offerLog.textContent = [...offers, ...messages].join("  →  ") || "No offers yet.";
  }

  function makeOffer() {
    if (state.phase !== "bargain" || state.awaitingResponse) return;
    if (state.mechanism === "demand" || state.mechanism === "midpoint") {
      lockClaim();
      return;
    }
    const p1Share = Number(ui.slider.value);
    state.pendingOffer = p1Share;
    state.offers.push({ by: state.turn, p1Share });
    refreshOfferLog();
    playTone(state.turn === 0 ? 430 : 520, .08, "square");
    setResponseMode();
  }

  function lockClaim() {
    const player = state.turn;
    state.claims[player] = Number(ui.slider.value);
    ui.mechanism.disabled = true;
    ui.offerLog.textContent = state.claims.map((claim, index) => claim === null ? `P${index + 1}: waiting` : `P${index + 1}: sealed ✓`).join("  ·  ");
    playTone(player === 0 ? 430 : 520, .08, "square");
    if (state.claims.some((claim) => claim === null)) {
      state.turn = 1 - player;
      setProposalMode();
      return;
    }

    const [claim1, claim2] = state.claims;
    if (state.mechanism === "demand") {
      const total = claim1 + claim2;
      if (total > 100) {
        noDeal(`Claims were P1 ${claim1}% + P2 ${claim2}% = ${total}%, more than the available pool.`);
        return;
      }
      const slack = (100 - total) / 2;
      setContract(claim1 + slack, `Sealed claims were ${claim1}% and ${claim2}%; the ${100 - total}% unclaimed remainder was split equally.`);
      return;
    }

    const p1ConcessionFromP2 = 100 - claim2;
    const midpoint = (claim1 + p1ConcessionFromP2) / 2;
    setContract(midpoint, `P1 anchored at ${claim1}%. P2's claim implied ${p1ConcessionFromP2}% for P1. Their midpoint is ${midpoint}%.`);
  }

  function setContract(p1Share, source) {
    const p1 = clamp(Number(p1Share), 20, 80);
    state.agreementMultiplier = state.mechanism === "deadline"
      ? 1 + 0.20 * clamp(state.remaining / state.bargainSeconds, 0, 1)
      : 1.10;
    state.contract = { p1: p1 / 100, p2: 1 - p1 / 100, multiplier: state.agreementMultiplier, mechanism: state.mechanism };
    ui.contractStrip.className = "contract-strip deal";
    ui.contractText.textContent = `${mechanisms[state.mechanism].name}: P1 ${p1}% · P2 ${100 - p1}%`;
    const bonus = Math.round((state.agreementMultiplier - 1) * 100);
    ui.contractDetail.textContent = `${source || "Agreement reached."} Shared-pool bonus: ${bonus}%.`;
    ui.bargainPanel.hidden = true;
    playChord([440, 554, 659]);
    beginCountdown();
  }

  function acceptOffer() {
    if (state.phase !== "bargain" || !state.awaitingResponse || state.pendingOffer === null) return;
    setContract(state.pendingOffer, `Player ${1 - state.turn + 1} accepted Player ${state.turn + 1}'s offer.`);
  }

  function counterOffer() {
    if (state.phase !== "bargain" || !state.awaitingResponse) return;
    if (state.mechanism === "ultimatum") return;
    state.turn = 1 - state.turn;
    state.pendingOffer = Number(ui.slider.value);
    setProposalMode();
  }

  function noDeal(reason) {
    if (state.phase !== "bargain") return;
    state.contract = null;
    ui.contractStrip.className = "contract-strip no-deal";
    ui.contractText.textContent = "No deal";
    ui.contractDetail.textContent = `Each miner keeps their own haul minus 15%. ${reason || ""}`.trim();
    ui.bargainPanel.hidden = true;
    playTone(145, .22, "sawtooth");
    beginCountdown();
  }

  function sendMessage(text) {
    if (state.phase !== "bargain") return;
    const speaker = state.awaitingResponse ? 1 - state.turn : state.turn;
    state.messages.push({ by: speaker, text });
    refreshOfferLog();
    playTone(speaker === 0 ? 360 : 470, .05, "triangle");
  }

  function beginCountdown() {
    state.phase = "countdown";
    state.remaining = 3;
    ui.countdown.hidden = false;
    ui.countdownText.textContent = "3";
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        ui.countdownText.textContent = String(count);
        playTone(320 + count * 90, .08, "triangle");
      } else {
        clearInterval(interval);
        ui.countdown.hidden = true;
        startMining();
      }
    }, 700);
  }

  function startMining() {
    state.phase = "mine";
    state.remaining = state.mineSeconds;
    state.haul = [0, 0];
    hooks.forEach(resetHook);
    generateObjects();
    ui.mineTip.textContent = state.contract ? "Contract active: mine for the joint pool." : "No deal: every catch is private.";
    updateScore();
    playTone(600, .12, "triangle");
  }

  function generateObjects() {
    state.objects = [];
    const plan = [
      "gem", "gem", "goldLarge", "goldLarge", "goldMedium", "goldMedium", "goldMedium",
      "goldSmall", "goldSmall", "goldSmall", "goldSmall", "rockLarge", "rockLarge", "rockSmall", "rockSmall", "rockSmall"
    ];
    const placed = [];
    plan.forEach((name, i) => {
      const type = types[name];
      let x, y, tries = 0;
      do {
        x = 75 + seededNoise(i + tries * 2.2, 1.7) * 850;
        y = 175 + seededNoise(i * 1.9 + tries, 4.3) * 325;
        tries++;
      } while (tries < 60 && placed.some((p) => Math.hypot(p.x - x, p.y - y) < p.r + type.radius + 18));
      const object = {
        id: `${state.round}-${i}`,
        type: name, x, y,
        r: type.radius,
        value: type.value,
        weight: type.weight,
        color: type.color,
        label: type.label,
        caught: false,
        wobble: seededNoise(i, 9) * Math.PI * 2
      };
      placed.push(object);
      state.objects.push(object);
    });
  }

  function dropHook(player) {
    if (state.phase !== "mine") return;
    const hook = hooks[player];
    if (hook.state !== "swing") return;
    hook.state = "extend";
    hook.length = 54;
    playTone(player === 0 ? 240 : 300, .04, "triangle");
  }

  function useDynamite(player) {
    if (state.phase !== "mine") return;
    const hook = hooks[player];
    if (hook.state !== "retract" || !hook.held || hook.dynamite <= 0) return;
    const item = hook.held;
    hook.dynamite--;
    hook.held = null;
    burst(item.x, item.y, "#ffb03b", 24);
    state.objects = state.objects.filter((o) => o !== item);
    hook.retractSpeed = 640;
    playTone(90, .26, "sawtooth");
  }

  function catchCheck(hook) {
    const tip = hookTip(hook);
    const candidates = state.objects.filter((o) => !o.caught && Math.hypot(o.x - tip.x, o.y - tip.y) < o.r + 10);
    if (!candidates.length) return false;
    candidates.sort((a, b) => Math.hypot(a.x - tip.x, a.y - tip.y) - Math.hypot(b.x - tip.x, b.y - tip.y));
    const item = candidates[0];
    item.caught = true;
    hook.held = item;
    hook.state = "retract";
    hook.retractSpeed = 350 / item.weight;
    playTone(item.type === "gem" ? 760 : 390, .08, "sine");
    return true;
  }

  function hookTip(hook) {
    return { x: hook.x + Math.cos(hook.angle) * hook.length, y: hook.y + Math.sin(hook.angle) * hook.length };
  }

  function updateHook(hook, index, dt) {
    if (hook.state === "swing") {
      hook.angle += hook.direction * hook.swingSpeed * dt;
      if (hook.angle <= hook.minAngle || hook.angle >= hook.maxAngle) {
        hook.angle = clamp(hook.angle, hook.minAngle, hook.maxAngle);
        hook.direction *= -1;
      }
      return;
    }

    if (hook.state === "extend") {
      hook.length += hook.extendSpeed * dt;
      const tip = hookTip(hook);
      if (catchCheck(hook)) return;
      if (hook.length >= hook.maxLength || tip.x < 12 || tip.x > 988 || tip.y > 548) {
        hook.state = "retract";
        hook.retractSpeed = 470;
      }
      return;
    }

    if (hook.state === "retract") {
      hook.length -= hook.retractSpeed * dt;
      if (hook.held) {
        const tip = hookTip(hook);
        hook.held.x = tip.x;
        hook.held.y = tip.y;
      }
      if (hook.length <= 54) {
        hook.length = 54;
        if (hook.held) collectItem(index, hook);
        hook.state = "swing";
        hook.retractSpeed = 350;
      }
    }
  }

  function collectItem(player, hook) {
    const item = hook.held;
    hook.held = null;
    if (!item) return;
    state.haul[player] += item.value;
    state.objects = state.objects.filter((o) => o !== item);
    burst(hook.x, hook.y + 20, item.color, item.type === "gem" ? 18 : 10);
    updateScore();
    playChord(item.type === "gem" ? [660, 880, 990] : [390, 520]);
  }

  function settleRound() {
    if (state.phase !== "mine") return;
    state.phase = "result";
    hooks.forEach((h, i) => {
      if (h.held) {
        h.held.caught = false;
        h.held = null;
      }
      h.state = "swing";
      h.length = 54;
      h.retractSpeed = 350;
    });

    let payout1, payout2, explanation;
    if (state.contract) {
      const finder1 = state.haul[0] * 0.30;
      const finder2 = state.haul[1] * 0.30;
      const multiplier = state.contract.multiplier || 1.10;
      const shared = (state.haul[0] + state.haul[1]) * 0.70 * multiplier;
      payout1 = finder1 + shared * state.contract.p1;
      payout2 = finder2 + shared * state.contract.p2;
      explanation = `Under ${mechanisms[state.contract.mechanism || "alternating"].name}, each miner kept 30% of their own haul. The remaining pool received a ${Math.round((multiplier - 1) * 100)}% cooperation bonus and was divided ${Math.round(state.contract.p1 * 100)}/${Math.round(state.contract.p2 * 100)}.`;
      ui.resultKicker.textContent = "Contract honored";
      ui.resultTitle.textContent = "Cooperation enlarged the pie";
    } else {
      payout1 = state.haul[0] * 0.85;
      payout2 = state.haul[1] * 0.85;
      explanation = "Talks failed, so each miner kept only their own haul after the 15% conflict tax.";
      ui.resultKicker.textContent = "No-deal settlement";
      ui.resultTitle.textContent = "Conflict was costly";
    }

    payout1 = Math.round(payout1);
    payout2 = Math.round(payout2);
    state.bank[0] += payout1;
    state.bank[1] += payout2;
    ui.p1Payout.textContent = money(payout1);
    ui.p2Payout.textContent = money(payout2);
    ui.resultExplanation.textContent = explanation;
    ui.nextRound.textContent = state.round >= state.maxRounds ? "See final result" : "Next negotiation";
    ui.resultPanel.hidden = false;
    updateScore();
  }

  function nextRound() {
    ui.resultPanel.hidden = true;
    if (state.round >= state.maxRounds) {
      showFinal();
      return;
    }
    state.round++;
    startBargaining();
  }

  function showFinal() {
    state.phase = "final";
    let title, detail;
    if (state.bank[0] === state.bank[1]) {
      title = "A golden draw";
      detail = `Both miners leave with ${money(state.bank[0])}. A rare perfectly balanced shaft.`;
    } else {
      const winner = state.bank[0] > state.bank[1] ? 1 : 2;
      const high = Math.max(...state.bank);
      const low = Math.min(...state.bank);
      title = `Player ${winner} wins the mine!`;
      detail = `${money(high)} to ${money(low)} after four rounds of hooks, counteroffers, and costly threats.`;
    }
    ui.winnerTitle.textContent = title;
    ui.winnerDetail.textContent = detail;
    ui.finalPanel.hidden = false;
    playChord([330, 440, 554, 660]);
  }

  function updateScore() {
    ui.p1Bank.textContent = money(state.bank[0]);
    ui.p2Bank.textContent = money(state.bank[1]);
    ui.p1Round.textContent = `Round haul ${money(state.haul[0])}`;
    ui.p2Round.textContent = `Round haul ${money(state.haul[1])}`;
    ui.round.textContent = `Round ${state.round}/${state.maxRounds}`;
    const phaseNames = { ready: "Ready", bargain: "Bargaining", countdown: "Entering mine", mine: "Mining", result: "Settlement", final: "Final" };
    ui.phase.textContent = phaseNames[state.phase] || state.phase;
    if (state.phase === "bargain") {
      ui.timer.textContent = `${Math.max(0, Math.ceil(state.remaining))}s`;
      if (state.mechanism === "deadline") {
        const liveBonus = Math.round(20 * clamp(state.remaining / state.bargainSeconds, 0, 1));
        ui.bargainTimer.textContent = `${Math.max(0, Math.ceil(state.remaining))}s · +${liveBonus}% bonus`;
      } else {
        ui.bargainTimer.textContent = `${Math.max(0, Math.ceil(state.remaining))}s`;
      }
      ui.timerFill.style.transform = `scaleX(${clamp(state.remaining / state.bargainSeconds, 0, 1)})`;
    } else if (state.phase === "mine") {
      ui.timer.textContent = `${Math.max(0, Math.ceil(state.remaining))}s`;
      ui.timerFill.style.transform = `scaleX(${clamp(state.remaining / state.mineSeconds, 0, 1)})`;
    } else {
      ui.timer.textContent = "—";
      ui.timerFill.style.transform = "scaleX(1)";
    }
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 145;
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 45, life: .65 + Math.random() * .55, color, size: 2 + Math.random() * 5 });
    }
  }

  function updateParticles(dt) {
    state.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; p.life -= dt; });
    state.particles = state.particles.filter((p) => p.life > 0);
  }

  let audioCtx = null;
  function playTone(freq, duration, type) {
    if (state.muted) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(.045, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (_) { /* sound is optional */ }
  }
  function playChord(freqs) { freqs.forEach((f, i) => setTimeout(() => playTone(f, .12, "triangle"), i * 55)); }

  function drawMine() {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#5b3b24");
    g.addColorStop(.18, "#3a271a");
    g.addColorStop(1, "#17100c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#2c2018";
    ctx.beginPath();
    ctx.moveTo(0, 118);
    for (let x = 0; x <= 1000; x += 50) {
      const y = 112 + seededNoise(x, 1) * 28;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(1000, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();

    for (let i = 0; i < 80; i++) {
      const x = seededNoise(i, 13) * 1000;
      const y = 130 + seededNoise(i, 29) * 420;
      const r = 1 + seededNoise(i, 33) * 4;
      ctx.fillStyle = `rgba(212,160,92,${.035 + seededNoise(i, 51) * .08})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    drawTimbers();
    state.objects.forEach(drawObject);
    hooks.forEach((h, i) => drawHook(h, i));
    state.particles.forEach((p) => {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawTimbers() {
    ctx.fillStyle = "#15100c";
    ctx.fillRect(0, 82, 1000, 8);
    [115, 500, 885].forEach((x) => {
      ctx.fillStyle = "#4c321e";
      ctx.fillRect(x - 10, 75, 20, 485);
      ctx.fillStyle = "rgba(238,185,101,.12)";
      ctx.fillRect(x - 7, 75, 4, 485);
    });
    ctx.strokeStyle = "#4c321e";
    ctx.lineWidth = 15;
    ctx.beginPath(); ctx.moveTo(115, 260); ctx.lineTo(500, 82); ctx.lineTo(885, 260); ctx.stroke();
  }

  function drawMiner(x, player) {
    const color = player === 0 ? "#a83e24" : "#177b78";
    ctx.save(); ctx.translate(x, 57);
    ctx.fillStyle = "#d6aa78"; ctx.beginPath(); ctx.arc(0, 2, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color; ctx.fillRect(-17, 14, 34, 30);
    ctx.fillStyle = "#ddb74c"; ctx.beginPath(); ctx.arc(0, -8, 19, Math.PI, 0); ctx.fill(); ctx.fillRect(-22, -8, 44, 6);
    ctx.fillStyle = "#17120e"; ctx.fillRect(-7, 0, 4, 3); ctx.fillRect(5, 0, 4, 3);
    ctx.fillStyle = "#eee2c7"; ctx.font = "900 10px sans-serif"; ctx.textAlign = "center"; ctx.fillText(`P${player + 1}`, 0, 34);
    ctx.restore();
  }

  function drawHook(hook, index) {
    drawMiner(hook.x, index);
    const tip = hookTip(hook);
    ctx.strokeStyle = "#c5aa7b"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(hook.x, hook.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
    ctx.save(); ctx.translate(tip.x, tip.y); ctx.rotate(hook.angle - Math.PI / 2);
    ctx.strokeStyle = "#d6c5a6"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.moveTo(0, 5); ctx.quadraticCurveTo(-12, 11, -15, 1); ctx.moveTo(0, 5); ctx.quadraticCurveTo(12, 11, 15, 1); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(15,10,7,.72)"; ctx.fillRect(hook.x - 34, 88, 68, 17);
    ctx.fillStyle = hook.color; ctx.font = "800 10px sans-serif"; ctx.textAlign = "center"; ctx.fillText(`DYNAMITE ${hook.dynamite}`, hook.x, 100);
  }

  function drawObject(item) {
    ctx.save(); ctx.translate(item.x, item.y); ctx.rotate(item.wobble);
    if (item.type === "gem") {
      ctx.shadowColor = "#4ff7ed"; ctx.shadowBlur = 18;
      ctx.fillStyle = item.color;
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(14, -5); ctx.lineTo(9, 14); ctx.lineTo(0, 20); ctx.lineTo(-9, 14); ctx.lineTo(-14, -5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(7, -4); ctx.lineTo(0, 0); ctx.lineTo(-7, -4); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = item.color;
      ctx.shadowColor = item.type.startsWith("gold") ? "rgba(242,182,50,.35)" : "transparent";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      const points = 10;
      for (let i = 0; i < points; i++) {
        const a = i / points * Math.PI * 2;
        const rr = item.r * (.82 + seededNoise(i, item.x) * .24);
        const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.beginPath(); ctx.arc(-item.r*.22, -item.r*.22, item.r*.23, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.rotate(-item.wobble);
    ctx.fillStyle = "rgba(10,7,5,.75)"; ctx.fillRect(-24, item.r + 6, 48, 15);
    ctx.fillStyle = "#fff2d7"; ctx.font = "900 9px sans-serif"; ctx.textAlign = "center"; ctx.fillText(item.label, 0, item.r + 17);
    ctx.restore();
  }

  function frame(now) {
    const dt = state.pageActive ? Math.min(.035, (now - state.lastTime) / 1000) : 0;
    state.lastTime = now;
    if (state.phase === "bargain") {
      state.remaining -= dt;
      if (state.remaining <= 0) noDeal("Time expired.");
    } else if (state.phase === "mine") {
      state.remaining -= dt;
      hooks.forEach((h, i) => updateHook(h, i, dt));
      if (state.remaining <= 0) settleRound();
    }
    updateParticles(dt);
    updateScore();
    drawMine();
    state.animationId = requestAnimationFrame(frame);
  }

  ui.slider.addEventListener("input", () => {
    const claimMode = state.mechanism === "demand" || state.mechanism === "midpoint";
    if (claimMode) setClaimVisual(state.turn, ui.slider.value);
    else setOfferVisual(ui.slider.value);
  });
  document.querySelectorAll("[data-split]").forEach((button) => button.addEventListener("click", () => {
    if (ui.slider.disabled) return;
    ui.slider.value = button.dataset.split;
    const claimMode = state.mechanism === "demand" || state.mechanism === "midpoint";
    if (claimMode) setClaimVisual(state.turn, ui.slider.value);
    else setOfferVisual(ui.slider.value);
  }));
  ui.mechanism.addEventListener("change", () => {
    if (state.phase === "bargain" && !ui.mechanism.disabled) startBargaining();
  });
  document.querySelectorAll("[data-message]").forEach((button) => button.addEventListener("click", () => sendMessage(button.dataset.message)));
  $("makeOfferBtn").addEventListener("click", makeOffer);
  $("acceptBtn").addEventListener("click", acceptOffer);
  $("counterBtn").addEventListener("click", counterOffer);
  $("rejectBtn").addEventListener("click", () => noDeal("A player walked away."));
  $("walkAwayBtn").addEventListener("click", () => noDeal("The proposer ended talks."));
  ui.nextRound.addEventListener("click", nextRound);
  $("playAgainBtn").addEventListener("click", resetMatch);
  ui.setupTimer.addEventListener("input", () => {
    const seconds = clamp(Number(ui.setupTimer.value), 10, 60);
    ui.setupTimerValue.textContent = `${seconds} seconds`;
    ui.setupTimer.setAttribute("aria-valuetext", `${seconds} seconds`);
  });
  $("startMatchBtn").addEventListener("click", beginMatch);

  document.addEventListener("keydown", (event) => {
    if (document.body.dataset.currentPage !== "game") return;
    if (["ArrowDown", "ArrowUp", " "].includes(event.key)) event.preventDefault();
    if (event.repeat) return;
    if (event.key.toLowerCase() === "s") dropHook(0);
    if (event.key.toLowerCase() === "w") useDynamite(0);
    if (event.key === "ArrowDown") dropHook(1);
    if (event.key === "ArrowUp") useDynamite(1);
  });
  $("p1DropTouch").addEventListener("pointerdown", () => dropHook(0));
  $("p1BombTouch").addEventListener("pointerdown", () => useDynamite(0));
  $("p2DropTouch").addEventListener("pointerdown", () => dropHook(1));
  $("p2BombTouch").addEventListener("pointerdown", () => useDynamite(1));

  $("rulesBtn").addEventListener("click", () => $("rulesDialog").showModal());
  $("researchBtn").addEventListener("click", () => $("researchDialog").showModal());
  $("muteBtn").addEventListener("click", () => {
    state.muted = !state.muted;
    $("muteBtn").textContent = state.muted ? "Sound off" : "Sound on";
  });

  function launchGame() {
    if (state.started) return;
    showSetup(false);
  }

  window.addEventListener("bargaining:open-game", launchGame);
  window.addEventListener("bargaining:page", (event) => {
    state.pageActive = Boolean(event.detail && event.detail.active);
    state.lastTime = performance.now();
  });
  generateObjects();
  updateScore();
  state.animationId = requestAnimationFrame(frame);
  if (document.body.dataset.currentPage === "game") launchGame();
})();

