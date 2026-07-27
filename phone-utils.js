function normalizePhone(value) {
  let t = String(value).replace(/[^0-9+]/g, "");
  if (t.startsWith("+880") || t.startsWith("0088")) {
    t = "0" + t.slice(4);
  } else if (t.startsWith("880") && t[3] === "1") {
    t = "0" + t.slice(3);
  }
  return t;
}

function setupPhoneAutofill(inputEl, getPatients, onMatch) {
  inputEl.addEventListener("input", () => {
    const t = normalizePhone(inputEl.value);
    inputEl.value = t;
    const patients = getPatients() || [];

    if (t.length >= 2 && t.length < 11) {
      const matches = patients.filter(p => p.phone && p.phone.startsWith(t));
      if (matches.length === 1) {
        inputEl.value = matches[0].phone;
        onMatch(matches[0]);
      }
    } else if (t.length >= 11) {
      const found = patients.find(p => p.phone === t);
      if (found) onMatch(found);
    }
  });
}
