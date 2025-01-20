// ========== DADES D'IMATGES ==========
const imatges = [
    { nom: "amanida",  categoria: "d", ruta: "imatges/d/amanida.png" },
    { nom: "banyador", categoria: "d", ruta: "imatges/d/banyador.png" },
    { nom: "cadena",   categoria: "d", ruta: "imatges/d/cadena.png" },
    { nom: "dau",      categoria: "d", ruta: "imatges/d/dau.svg" },
    { nom: "davantal", categoria: "d", ruta: "imatges/d/davantal.png" },
    { nom: "dit",      categoria: "d", ruta: "imatges/d/dit.png" },
    { nom: "dutxa",    categoria: "d", ruta: "imatges/d/dutxa.png" },
  
    { nom: "balena",   categoria: "l", ruta: "imatges/l/balena.png" },
    { nom: "colze",    categoria: "l", ruta: "imatges/l/colze.png" },
    { nom: "galeta",   categoria: "l", ruta: "imatges/l/galeta.png" },
    { nom: "lavabo",   categoria: "l", ruta: "imatges/l/lavabo.png" },
    { nom: "lupa",     categoria: "l", ruta: "imatges/l/lupa.png" },
    { nom: "melo",     categoria: "l", ruta: "imatges/l/melo.png" },
    { nom: "pala",     categoria: "l", ruta: "imatges/l/pala.png" },
    { nom: "pilota",   categoria: "l", ruta: "imatges/l/pilota.png" },
    { nom: "plàtan",   categoria: "l", ruta: "imatges/l/platan.png" },
  
    { nom: "cara",     categoria: "r", ruta: "imatges/r/cara.png" },
    { nom: "caramel",  categoria: "r", ruta: "imatges/r/caramel.png" },
    { nom: "cargol",   categoria: "r", ruta: "imatges/r/cargol.png" },
    { nom: "cinturo",  categoria: "r", ruta: "imatges/r/cinturo.png" },
    { nom: "fruita",   categoria: "r", ruta: "imatges/r/fruita.png" },
    { nom: "rata",     categoria: "r", ruta: "imatges/r/rata.png" },
    { nom: "robot",    categoria: "r", ruta: "imatges/r/robot.png" }
  ];
  
  // ========== CONFIGURACIÓ ==========
  const ROWS = 4;
  const COLS = 6;
  const FIXED_STEPS = 8; // 7 passos
  
  let lives = 3;
  let correctPath = [];
  let nextStepIndex = 0;
  
  let selectedObjective = "";
  let selectedNoises = [];
  
  // Pools d'imatges per no repetir
  let objectivePool = [];
  let noisePool = [];
  let objIndex = 0;
  let noiseIndex = 0;
  
  // Sons (correcte/error)
  const soundClick = new Audio("sons/bloop.mp3");
  const soundError = new Audio("sons/error.mp3");
  
  // ====================== FUNCS AUX ======================
  function showSection(id) {
    document.querySelectorAll("section").forEach(sec => sec.classList.add("is-hidden"));
    document.getElementById(id).classList.remove("is-hidden");
  }
  
  function openModal(id) {
    document.getElementById(id).classList.add("is-active");
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove("is-active");
  }
  
  function getUniqueCategories() {
    return [...new Set(imatges.map(i => i.categoria))];
  }
  
  // Barregem (Fisher-Yates)
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  // Genera un camí de 7 passos (amunt/dreta) sense repetir casella
  function generateRandomPath(steps) {
    const path = [];
    let row = ROWS - 1; // comencem avall-esquerra
    let col = 0;
    path.push([row, col]);
    for (let i = 0; i < steps; i++) {
      const possibleMoves = [];
      // amunt
      if (row > 0 && !path.some(([r,c]) => r===row-1 && c===col)) {
        possibleMoves.push([-1, 0]);
      }
      // dreta
      if (col < COLS-1 && !path.some(([r,c]) => r===row && c===col+1)) {
        possibleMoves.push([0, 1]);
      }
      if (!possibleMoves.length) break;
      const [dr,dc] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      row += dr;
      col += dc;
      path.push([row, col]);
    }
    return path;
  }
  
  // Actualitzar cors
  function updateLivesUI() {
    const container = document.getElementById("life-container");
    container.innerHTML = "";
    for (let i = 0; i < lives; i++) {
      const span = document.createElement("span");
      span.classList.add("heart");
      span.textContent = "❤️";
      container.appendChild(span);
    }
  }
  
  // Pools
  function getNextObjectiveImage() {
    const img = objectivePool[objIndex];
    objIndex++;
    if (objIndex >= objectivePool.length) objIndex = 0;
    return img;
  }
  function getNextNoiseImage() {
    const img = noisePool[noiseIndex];
    noiseIndex++;
    if (noiseIndex >= noisePool.length) noiseIndex = 0;
    return img;
  }
  
  function getCell(r, c) {
    return document.querySelector(`.grid-cell[data-row='${r}'][data-col='${c}']`);
  }
  
  // ====================== CREAR LABERINT ======================
  function createLabyrinth() {
    // Reset
    lives = 3;
    updateLivesUI();
    correctPath = generateRandomPath(FIXED_STEPS);
    nextStepIndex = 0;
  
    // Prepara llistes d'imatges (barrejades)
    objectivePool = imatges.filter(i => i.categoria === selectedObjective);
    shuffleArray(objectivePool);
    objIndex = 0;
  
    noisePool = imatges.filter(i => selectedNoises.includes(i.categoria));
    shuffleArray(noisePool);
    noiseIndex = 0;
  
    // Traiem la fitxa (si existeix)
    const tokenEl = document.getElementById("game-token");
    tokenEl.remove();
  
    // Netegem la graella
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
  
    // Tornem a inserir la fitxa
    grid.appendChild(tokenEl);
  
    // Creem cel·les
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.dataset.row = r;
        cell.dataset.col = c;
  
        const inPath = correctPath.some(([rr,cc]) => rr===r && cc===c);
        let imgData;
        if (inPath) {
          imgData = getNextObjectiveImage();
        } else {
          imgData = getNextNoiseImage();
        }
  
        if (imgData) {
          const img = document.createElement("img");
          img.src = imgData.ruta;
          img.alt = imgData.nom;
          cell.appendChild(img);
        }
  
        cell.addEventListener("click", onCellClick);
        grid.appendChild(cell);
      }
    }
  
    // Col·locar la fitxa fora de la primera casella
    placeTokenOutsideStart();
  }
  
  function placeTokenOutsideStart() {
    if (!correctPath.length) return;
    const [startR, startC] = correctPath[0];
    const firstCell = getCell(startR, startC);
    if (!firstCell) return;
  
    const tokenEl = document.getElementById("game-token");
    const rectCell = firstCell.getBoundingClientRect();
    const rectGrid = document.getElementById("grid").getBoundingClientRect();
  
    // Ajusta com vulguis la posició "fora"
    const offsetX = -60;
    const offsetY = rectCell.height / 2 - 20;
  
    tokenEl.style.left = (rectCell.left - rectGrid.left + offsetX) + "px";
    tokenEl.style.top  = (rectCell.top - rectGrid.top + offsetY) + "px";
  }
  
  // ====================== CLICK CASELLA ======================
  function onCellClick(e) {
    const cell = e.currentTarget;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
  
    const [corrR, corrC] = correctPath[nextStepIndex];
    if (row === corrR && col === corrC) {
      // encert
      cell.classList.add("found");
      // so clic
      soundClick.currentTime = 0;
      soundClick.play().catch(() => { /* ignora error */ });
  
      moveTokenToCell(row, col);
      nextStepIndex++;
      if (nextStepIndex === correctPath.length) {
        openModal("modal-win");
      }
    } else {
      // error
      lives--;
      updateLivesUI();
      // so error
      soundError.currentTime = 0;
      soundError.play().catch(() => { /* ignora error */ });
  
      openModal("modal-error");
      if (lives <= 0) {
        closeModal("modal-error");
        openModal("modal-gameover");
      }
    }
  }
  
  // Moure fitxa al centre de la casella
  function moveTokenToCell(r, c) {
    const cell = getCell(r, c);
    if (!cell) return;
    const tokenEl = document.getElementById("game-token");
    if (!tokenEl) return;
  
    const rectCell = cell.getBoundingClientRect();
    const rectGrid = document.getElementById("grid").getBoundingClientRect();
    const left = rectCell.left - rectGrid.left + rectCell.width / 2 - 20;
    const top  = rectCell.top  - rectGrid.top + rectCell.height / 2 - 20;
  
    tokenEl.style.left = left + "px";
    tokenEl.style.top = top + "px";
  }
  
  // ====================== DOM READY ======================
  window.addEventListener("DOMContentLoaded", () => {
    // 1) Pantalla benvinguda
    showSection("section-welcome");
  
    // 2) Omplir selecció de sons
    const selectObj = document.getElementById("select-objective-sound");
    const chkContainer = document.getElementById("checkbox-sounds");
    const cats = getUniqueCategories();
  
    cats.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.toUpperCase();
      selectObj.appendChild(opt);
    });
  
    function renderNoiseCheckboxes() {
      chkContainer.innerHTML = "";
      cats.forEach(cat => {
        if (cat !== selectedObjective) {
          const label = document.createElement("label");
          label.classList.add("checkbox", "mr-3");
          const input = document.createElement("input");
          input.type = "checkbox";
          input.value = cat;
          input.checked = true;
          label.appendChild(input);
          label.append(" " + cat.toUpperCase());
          chkContainer.appendChild(label);
        }
      });
    }
  
    selectedObjective = selectObj.value;
    renderNoiseCheckboxes();
  
    selectObj.addEventListener("change", () => {
      selectedObjective = selectObj.value;
      renderNoiseCheckboxes();
    });
  
    // 3) Botons
    document.getElementById("btnStart").addEventListener("click", () => {
      showSection("section-selection");
    });
    document.getElementById("btnGenerateLab").addEventListener("click", () => {
      // recollir sorolls
      selectedNoises = [];
      chkContainer.querySelectorAll("input[type='checkbox']").forEach(chk => {
        if (chk.checked) {
          selectedNoises.push(chk.value);
        }
      });
      // generar
      createLabyrinth();
      showSection("section-labyrinth");
    });
  
    // Torna a la selecció
    // document.getElementById("btnReturn").addEventListener("click", () => {
    //   showSection("section-selection");
    // });
  
    // 4) Modals
    document.getElementById("btnCloseErrorModal").addEventListener("click", () => {
      closeModal("modal-error");
    });
    document.getElementById("btnErrorOk").addEventListener("click", () => {
      closeModal("modal-error");
    });
    document.getElementById("btnGameOver").addEventListener("click", () => {
      closeModal("modal-gameover");
      showSection("section-welcome");
    });
    document.getElementById("btnWinOk").addEventListener("click", () => {
      closeModal("modal-win");
      showSection("section-welcome");
    });
  });
  