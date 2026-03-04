const apiBase = "/api";

const summaryEl = document.getElementById("summary");
const playersGridEl = document.getElementById("playersGrid");
const statusEl = document.getElementById("status");
const topListEl = document.getElementById("topList");

const filtersForm = document.getElementById("filtersForm");
const createForm = document.getElementById("createForm");
const loadTopBtn = document.getElementById("loadTopBtn");

const buildQuery = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      query.append(key, value);
    }
  });

  return query.toString();
};

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
};

const renderPlayers = (players) => {
  if (!players || players.length === 0) {
    playersGridEl.innerHTML = "<p>Nenhum jogador encontrado.</p>";
    return;
  }

  playersGridEl.innerHTML = players
    .map((player) => {
      return `
      <article class="card">
        <h3>${player.name}</h3>
        <div class="meta">${player.club} | ${player.position}</div>
        <div class="meta">${player.nationality}</div>
        <span class="badge">Overall ${player.statistics.Overall}</span>
      </article>
    `;
    })
    .join("");
};

const loadSummary = async () => {
  try {
    const response = await fetch(`${apiBase}/players/summary`);
    if (response.status === 204) {
      summaryEl.innerHTML = "<p>Sem dados disponiveis.</p>";
      return;
    }

    const data = await response.json();
    summaryEl.innerHTML = `
      <div class="summary-item"><span>Total de jogadores</span><strong>${data.totalPlayers}</strong></div>
      <div class="summary-item"><span>Clubes unicos</span><strong>${data.uniqueClubs}</strong></div>
      <div class="summary-item"><span>Nacionalidades unicas</span><strong>${data.uniqueNationalities}</strong></div>
      <div class="summary-item"><span>Media Overall</span><strong>${data.averageStatistics.Overall}</strong></div>
    `;
  } catch (_error) {
    summaryEl.innerHTML = "<p>Erro ao carregar resumo.</p>";
  }
};

const loadPlayers = async (filters = {}) => {
  try {
    const query = buildQuery(filters);
    const response = await fetch(`${apiBase}/players${query ? `?${query}` : ""}`);

    if (response.status === 204) {
      renderPlayers([]);
      setStatus("Nenhum resultado para os filtros.");
      return;
    }

    const players = await response.json();
    renderPlayers(players);
    setStatus(`${players.length} jogador(es) exibido(s).`);
  } catch (_error) {
    setStatus("Falha ao buscar jogadores.", true);
  }
};

const loadTop = async () => {
  const metric = document.getElementById("topMetric").value;
  const limit = document.getElementById("topLimit").value;
  const query = buildQuery({ metric, limit });

  try {
    const response = await fetch(`${apiBase}/players/top?${query}`);
    if (response.status === 204) {
      topListEl.innerHTML = "<li>Nenhum dado</li>";
      return;
    }

    const topPlayers = await response.json();
    topListEl.innerHTML = topPlayers
      .map((item, index) => {
        return `<li><span>#${index + 1} ${item.name} (${item.club})</span><strong>${item.metric}: ${item.score}</strong></li>`;
      })
      .join("");
  } catch (_error) {
    topListEl.innerHTML = "<li>Erro ao carregar ranking.</li>";
  }
};

filtersForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const filters = {
    name: document.getElementById("name").value.trim(),
    club: document.getElementById("club").value.trim(),
    nationality: document.getElementById("nationality").value.trim(),
    position: document.getElementById("position").value.trim(),
    sort: document.getElementById("sort").value,
    order: document.getElementById("order").value,
    limit: document.getElementById("limit").value,
  };

  await loadPlayers(filters);
});

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById("createName").value.trim(),
    club: document.getElementById("createClub").value.trim(),
    nationality: document.getElementById("createNationality").value.trim(),
    position: document.getElementById("createPosition").value.trim(),
    statistics: {
      Overall: Number(document.getElementById("ovr").value),
      Pace: Number(document.getElementById("pace").value),
      Shooting: Number(document.getElementById("shooting").value),
      Passing: Number(document.getElementById("passing").value),
      Dribbling: Number(document.getElementById("dribbling").value),
      Defending: Number(document.getElementById("defending").value),
      Physical: Number(document.getElementById("physical").value),
    },
  };

  try {
    const response = await fetch(`${apiBase}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setStatus("Nao foi possivel criar o jogador.", true);
      return;
    }

    setStatus("Jogador criado com sucesso.");
    createForm.reset();
    await Promise.all([loadPlayers(), loadSummary(), loadTop()]);
  } catch (_error) {
    setStatus("Erro de rede ao criar jogador.", true);
  }
});

loadTopBtn.addEventListener("click", loadTop);

Promise.all([loadSummary(), loadPlayers(), loadTop()]);
