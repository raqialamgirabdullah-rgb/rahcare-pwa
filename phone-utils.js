/**
 * Normalizes a Bangladeshi phone number to the local 01XXXXXXXXX format.
 * Accepts inputs like +8801..., 008801..., 8801..., 01...
 */
export function normalizePhone(value) {
  let t = String(value).replace(/[^0-9+]/g, "");
  if (t.startsWith("+880") || t.startsWith("0088")) {
    t = "0" + t.slice(4);
  } else if (t.startsWith("880") && t[3] === "1") {
    t = "0" + t.slice(3);
  }
  return t;
}

/**
 * Wires a phone <input> element to:
 *  - auto-normalize whatever the user types
 *  - auto-fill patient details when a saved phone number matches
 *
 * getPatients() must return the current array of known patients
 * (each with at least a `.phone` field).
 * onMatch(patient) is called with the matched patient record.
 */
export function setupPhoneAutofill(inputEl, getPatients, onMatch) {
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
