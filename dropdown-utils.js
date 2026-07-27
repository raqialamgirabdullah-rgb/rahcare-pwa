function toggleMenu(id) {
  document.querySelectorAll(".dd-menu").forEach(menu => {
    if (menu.id !== id) menu.classList.remove("open");
  });
  document.getElementById(id).classList.toggle("open");
}

function setupOutsideClickClose() {
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dd")) {
      document.querySelectorAll(".dd-menu").forEach(menu => menu.classList.remove("open"));
    }
  });
}

function setupAddressDropdown(menuEl, btnEl, valEl, addressData, onSelect) {
  function showDivisions() {
    menuEl.innerHTML = "";
    Object.keys(addressData).forEach(division => {
      const item = document.createElement("span");
      item.textContent = division;
      item.onclick = (e) => {
        e.stopPropagation();
        showDistricts(division);
      };
      menuEl.appendChild(item);
    });
  }

  function showDistricts(division) {
    menuEl.innerHTML = "";
    const back = document.createElement("span");
    back.className = "back-opt";
    back.textContent = "🔙 Back to Divisions";
    back.onclick = (e) => {
      e.stopPropagation();
      showDivisions();
    };
    menuEl.appendChild(back);

    addressData[division].forEach(district => {
      const item = document.createElement("span");
      item.textContent = district;
      item.onclick = () => {
        valEl.textContent = `${division}, ${district}`;
        btnEl.classList.add("selected");
        menuEl.classList.remove("open");
        showDivisions();
        onSelect(`${division}, ${district}`);
      };
      menuEl.appendChild(item);
    });
  }

  showDivisions();
                                  }
