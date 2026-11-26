var capTotal = 200000000;
var capUsed = 213000000;
function fmt(n) {
  return "$" + n.toLocaleString("en-US");
}
function updateCap() {
  var base = parseFloat(document.getElementById("base").value) || 0;
  var bonus = parseFloat(document.getElementById("bonus").value) || 0;
  var years = parseInt(document.getElementById("years").value) || 1;
  var total = (base * years) + bonus;
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
  var summary = years + " years at " + fmt(base) + "/yr with a " + fmt(bonus) + " signing bonus";
  if (bonusTexts.length) summary += " and " + bonusTexts.length + " performance bonus" + (bonusTexts.length > 1 ? "es" : "");
  summary += ". Total cap hit: " + fmt((base * years) + bonus) + ".";
  if (!confirm("Are you sure? You're offering " + summary)) {
    return;
  }
  var agentBox = document.getElementById("agentBox");
  var resultBox = document.getElementById("resultBox");
  agentBox.style.display = "block";
  resultBox.style.display = "block";
  if (decision === "accept") {
    capUsed = capUsed + (base * years) + bonus;
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