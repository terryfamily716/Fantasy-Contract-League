var capTotal = 200000000;
var capUsed = 213000000;
var deal = null;
function fmt(n) {
  return "$" + n.toLocaleString("en-US");
}
function updateCap() {
  var base = parseFloat(document.getElementById("base").value) || 0;
  var bonus = parseFloat(document.getElementById("bonus").value) || 0;
  var years = parseInt(document.getElementById("years").value) || 1;
  var total = base + (bonus / years);
  document.getElementById("capUsed").textContent = fmt(capUsed + total);
  var remEl = document.getElementById("capRemaining");
  remEl.textContent = fmt(capTotal - capUsed - total);
  remEl.className = (capTotal - capUsed - total) < 0 ? "negative" : "remaining";
  updateBreakdown();
}
function updateBreakdown() {
  var base = parseFloat(document.getElementById("base").value) || 0;
  var bonus = parseFloat(document.getElementById("bonus").value) || 0;
  var years = parseInt(document.getElementById("years").value) || 1;
  var grid = document.getElementById("yearGrid");
  grid.innerHTML = "";
  var proratedBonus = bonus / years;
  for (var i = 1; i <= years; i++) {
    var amt = base + proratedBonus;
    var box = document.createElement("div");
    box.className = "year-box";
    box.innerHTML = "<div class=\"yr\">Year " + i + "</div><div class=\"amt\">" + fmt(amt) + "</div><div class=\"bonus-part\">incl. " + fmt(proratedBonus) + " prorated bonus</div>";
    grid.appendChild(box);
  }
}
["base", "bonus", "years"].forEach(function(id) {
  document.getElementById(id).addEventListener("input", updateCap);
});
updateCap();
function makeDecision(decision) {
  var base = parseFloat(document.getElementById("base").value) || 0;
  var bonus = parseFloat(document.getElementById("bonus").value) || 0;
  var years = parseInt(document.getElementById("years").value) || 1;
  var guaranteed = parseFloat(document.getElementById("guaranteed").value) || 0;
  var noTrade = document.getElementById("noTrade").checked;
  var checked = document.querySelectorAll(".bonus-cb:checked");
  var bonusTexts = [];
  var bonusTotal = 0;
  checked.forEach(function(cb) { bonusTexts.push(cb.parentElement.textContent.trim()); bonusTotal += parseFloat(cb.getAttribute("data-amount")); });
  var yearHit = base + (bonus / years);
  var summary = years + " years at " + fmt(base) + "/yr with a " + fmt(bonus) + " signing bonus";
  if (bonusTexts.length) summary += " and " + bonusTexts.length + " performance bonus" + (bonusTexts.length > 1 ? "es" : "");
  summary += ". Cap hit per year: " + fmt(yearHit) + ".";
  if (!confirm("Are you sure? You're offering " + summary)) {
    return;
  }
  var agentBox = document.getElementById("agentBox");
  var resultBox = document.getElementById("resultBox");
  agentBox.style.display = "block";
  resultBox.style.display = "block";
  if (decision === "accept") {
    deal = { years: years, base: base, bonus: bonus, guaranteed: guaranteed, noTrade: noTrade, bonusTexts: bonusTexts, voidYears: 0, rolledYear: null, deferred: false };
    capUsed = 203000000 + yearHit;
    document.getElementById("capUsed").textContent = fmt(capUsed);
    var remEl = document.getElementById("capRemaining");
    remEl.textContent = fmt(capTotal - capUsed);
    remEl.className = (capTotal - capUsed) < 0 ? "negative" : "remaining";
    var dealSpan = document.querySelector(".current-deal span");
    dealSpan.textContent = years + " years, " + fmt(base) + "/yr";
    var dealExtra = " | " + (years - 1) + " year" + (years - 1 !== 1 ? "s" : "") + " left | " + (noTrade ? "No-trade clause | " : "") + fmt(guaranteed) + " guaranteed";
    document.querySelector(".current-deal").innerHTML = "Current deal: <span>" + dealSpan.textContent + "</span>" + dealExtra;
    document.getElementById("agentReasoning").textContent = "Agent Delacroix: Deal accepted. Jefferson values the guarantee and the competitive window. Cutthroat agents don't bluff twice.";
    document.getElementById("agentCounter").textContent = "Signed: " + years + " years, " + fmt(base) + "/yr base, " + fmt(bonus) + " bonus, " + fmt(guaranteed) + " guaranteed" + (noTrade ? ", no-trade clause" : "") + (bonusTexts.length ? ", bonuses: " + bonusTexts.join(", ") : "") + ".";
    document.getElementById("agentBonus").textContent = "";
    resultBox.className = "result success";
    resultBox.textContent = "SIGNED. Jefferson is on your roster. Cap updated.";
    document.getElementById("btnAccept").disabled = true;
    document.getElementById("btnCounter").disabled = true;
    document.getElementById("btnPass").disabled = true;
    document.getElementById("restructurePanel").style.display = "block";
    renderDealGrid();
  } else if (decision === "counter") {
    var counterYears = Math.min(years + 1, 5);
    var counterBase = base + 4000000;
    document.getElementById("agentReasoning").textContent = "Agent Delacroix: Close, but Jefferson wants one more year and a bump. He's eyeing a ring and won't leave money on the table for a rebuilding team.";
    document.getElementById("agentCounter").textContent = "Counter: " + counterYears + " years, " + fmt(counterBase) + "/yr, " + fmt(bonus) + " bonus" + (noTrade ? ", no-trade clause included" : "") + ".";
    document.getElementById("agentBonus").textContent = "Agent bonus demand: 100 receptions - $5,000,000. Delacroix wants it written in before he talks numbers.";
    resultBox.className = "result fail";
    resultBox.textContent = "Counter received. Revise your offer or pass.";
  } else {
    document.getElementById("agentReasoning").textContent = "Agent Delacroix: Jefferson declines. He'd rather bet on himself with a contender. Delacroix is already texting other GMs.";
    document.getElementById("agentCounter").textContent = "Player hits the open market. Other teams can now bid.";
    document.getElementById("agentBonus").textContent = "";
    resultBox.className = "result fail";
    resultBox.textContent = "Passed. Jefferson is available to other teams.";
    document.getElementById("btnAccept").disabled = true;
    document.getElementById("btnCounter").disabled = true;
    document.getElementById("btnPass").disabled = true;
  }
}
function renderDealGrid() {
  if (!deal) return;
  var grid = document.getElementById("dealGrid");
  grid.innerHTML = "";
  var prorated = deal.deferred ? 0 : (deal.bonus / deal.years);
  var rolled = deal.rolledYear;
  for (var i = 1; i <= deal.years; i++) {
    var amt = deal.base + prorated;
    if (rolled === i) amt += deal.bonus;
    var box = document.createElement("div");
    box.className = "year-box";
    var label = "Year " + i;
    if (rolled === i) label += " (bonus rolled)";
    box.innerHTML = "<div class=\"yr\">" + label + "</div><div class=\"amt\">" + fmt(amt) + "</div>";
    grid.appendChild(box);
  }
  for (var v = 0; v < deal.voidYears; v++) {
    var vbox = document.createElement("div");
    vbox.className = "year-box";
    vbox.innerHTML = "<div class=\"yr\">Void " + (v + 1) + "</div><div class=\"amt\">$0</div><div class=\"bonus-part\">dead cap</div>";
    grid.appendChild(vbox);
  }
}
function restructure(action) {
  if (!deal) return;
  if (action === "void") {
    deal.voidYears++;
    renderDealGrid();
    document.getElementById("restructureNote").textContent = "Added void year " + deal.voidYears + ". Cap hit unchanged, term extended. Dead cap: $0 this year.";
  } else if (action === "roll") {
    if (deal.rolledYear) { document.getElementById("restructureNote").textContent = "Bonus already rolled into year " + deal.rolledYear + "."; return; }
    deal.rolledYear = 1;
    deal.deferred = false;
    var newHit = deal.base + deal.bonus;
    capUsed = 203000000 + newHit;
    document.getElementById("capUsed").textContent = fmt(capUsed);
    var remEl = document.getElementById("capRemaining");
    remEl.textContent = fmt(capTotal - capUsed);
    remEl.className = (capTotal - capUsed) < 0 ? "negative" : "remaining";
    renderDealGrid();
    document.getElementById("restructureNote").textContent = "Rolled " + fmt(deal.bonus) + " bonus into year 1. This year's hit is now " + fmt(newHit) + ". Future years drop to " + fmt(deal.base) + "/yr.";
  } else if (action === "shorten") {
    if (deal.years <= 1) { document.getElementById("restructureNote").textContent = "Can't shorten below 1 year."; return; }
    deal.years--;
    if (!deal.deferred) {
      var hit = deal.base + (deal.bonus / deal.years);
      capUsed = 203000000 + hit;
      document.getElementById("capUsed").textContent = fmt(capUsed);
      var remEl2 = document.getElementById("capRemaining");
      remEl2.textContent = fmt(capTotal - capUsed);
      remEl2.className = (capTotal - capUsed) < 0 ? "negative" : "remaining";
    }
    renderDealGrid();
    document.getElementById("restructureNote").textContent = "Shortened to " + deal.years + " years. Prorated bonus now " + fmt(deal.bonus / deal.years) + "/yr.";
  } else if (action === "push") {
    var amt = 5000000;
    deal.base = deal.base - amt;
    renderDealGrid();
    document.getElementById("restructureNote").textContent = "Pushed " + fmt(amt) + " from year 1 into year " + deal.years + ". Year 1 hit now " + fmt(deal.base + (deal.deferred ? 0 : deal.bonus / deal.years)) + ".";
  } else if (action === "defer") {
    deal.deferred = !deal.deferred;
    if (deal.deferred) {
      capUsed = 203000000 + deal.base;
      document.getElementById("restructureNote").textContent = "Bonus deferred. This year's hit is just base salary: " + fmt(deal.base) + ". " + fmt(deal.bonus) + " spreads across remaining years.";
    } else {
      capUsed = 203000000 + deal.base + (deal.bonus / deal.years);
      document.getElementById("restructureNote").textContent = "Deferral removed. Bonus prorated again: " + fmt(deal.bonus / deal.years) + "/yr.";
    }
    document.getElementById("capUsed").textContent = fmt(capUsed);
    var remEl3 = document.getElementById("capRemaining");
    remEl3.textContent = fmt(capTotal - capUsed);
    remEl3.className = (capTotal - capUsed) < 0 ? "negative" : "remaining";
    renderDealGrid();
  } else if (action === "hybrid") {
    deal.voidYears++;
    if (!deal.rolledYear) { deal.rolledYear = deal.years; }
    var hHit = deal.base + deal.bonus;
    capUsed = 203000000 + hHit;
    document.getElementById("capUsed").textContent = fmt(capUsed);
    var remEl4 = document.getElementById("capRemaining");
    remEl4.textContent = fmt(capTotal - capUsed);
    remEl4.className = (capTotal - capUsed) < 0 ? "negative" : "remaining";
    renderDealGrid();
    document.getElementById("restructureNote").textContent = "Hybrid: void year added + bonus rolled into final year. This year's hit: " + fmt(hHit) + ".";
  }
}