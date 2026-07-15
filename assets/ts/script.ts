// INTERFACCE

interface TeamApiResponse {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
  strLeague: string;
  strCountry: string;
}

interface EventApiResponse {
  idEvent: string;
  dateEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
}

interface EventsNextResponse {
  events: EventApiResponse[] | null;
}

interface EventsLastResponse {
  results: EventApiResponse[] | null;
}

// CLASSI

class Squadra {
  id: string;
  nome: string;
  logo: string;
  lega: string;
  paese: string;

  constructor(
    idTeam: string,
    strTeam: string,
    strTeamBadge: string,
    strLeague: string,
    strCountry: string,
  ) {
    this.id = idTeam;
    this.nome = strTeam;
    this.logo = strTeamBadge;
    this.lega = strLeague;
    this.paese = strCountry;
  }
}

class Evento {
  id: string;
  data: string;
  casa: string;
  trasferta: string;
  punteggioCasa: string | null;
  punteggioTrasferta: string | null;
  constructor(
    idEvent: string,
    dateEvent: string,
    strHomeTeam: string,
    strAwayTeam: string,
    intHomeScore: string | null,
    intAwayScore: string | null,
  ) {
    this.id = idEvent;
    this.data = dateEvent;
    this.casa = strHomeTeam;
    this.trasferta = strAwayTeam;
    this.punteggioCasa = intHomeScore;
    this.punteggioTrasferta = intAwayScore;
  }

  dataPartita(): string {
    const parteData = this.data.split("-");
    return parteData[2] + "/" + parteData[1] + "/" + parteData[0];
  }

  punteggioFormattato(): string {
    if (this.punteggioCasa === null) {
      return "Da giocare";
    }
    return this.punteggioCasa + " - " + this.punteggioTrasferta;
  }
}

// API

interface Teams {
  teams: TeamApiResponse[] | null;
}

async function cercaSquadre(query: string): Promise<Squadra[] | string> {
  try {
    const squadra = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${query}`,
    );
    const dati: Teams = await squadra.json();
    if (dati.teams === null) {
      return "Nessuna squadra corrisponde alla ricerca";
    }
    const squadre = dati.teams.map(
      (item) =>
        new Squadra(
          item.idTeam,
          item.strTeam,
          item.strTeamBadge,
          item.strLeague,
          item.strCountry,
        ),
    );
    return squadre;
  } catch (errore) {
    console.error(errore);
    return "Errore durante la ricerca, riprova più tardi.";
  }
}

async function caricaDettagli(
  idTeam: string,
): Promise<{ prossimi: Evento[]; ultimi: Evento[] } | string> {
  try {
    const [rispostaProssimi, rispostaUltimi] = await Promise.all([
      fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${idTeam}`,
      ),
      fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${idTeam}`,
      ),
    ]);
    const datiProssimi: EventsNextResponse = await rispostaProssimi.json();
    const datiUltimi: EventsLastResponse = await rispostaUltimi.json();
    const prossimi =
      datiProssimi.events === null
        ? []
        : datiProssimi.events.map(
            (item) =>
              new Evento(
                item.idEvent,
                item.dateEvent,
                item.strHomeTeam,
                item.strAwayTeam,
                item.intHomeScore,
                item.intAwayScore,
              ),
          );
    const ultimi =
      datiUltimi.results === null
        ? []
        : datiUltimi.results.map(
            (item) =>
              new Evento(
                item.idEvent,
                item.dateEvent,
                item.strHomeTeam,
                item.strAwayTeam,
                item.intHomeScore,
                item.intAwayScore,
              ),
          );
    return { prossimi, ultimi };
  } catch (errore) {
    console.error(errore);
    return "Errore durante la ricerca, riprova più tardi.";
  }
}

// STATO

let preferiti: Squadra[] = JSON.parse(
  localStorage.getItem("preferiti") ?? "[]",
);

function salvaPreferiti() {
  localStorage.setItem("preferiti", JSON.stringify(preferiti));
}

function isPreferita(idSquadra: string) {
  return preferiti.some((p) => p.id === idSquadra);
}

function aggiungiPreferito(squadra: Squadra) {
  if (isPreferita(squadra.id)) return;
  preferiti.push(squadra);
  salvaPreferiti();
  renderPreferiti();
  renderSquadraFissa();
}

function rimuoviPreferito(idSquadra: string) {
  preferiti = preferiti.filter((p) => p.id !== idSquadra);
  salvaPreferiti();
  renderPreferiti();
  renderSquadraFissa();
}

// RENDER

const contenitoreSquadre = document.getElementById("lista-squadre");
const contenitorePreferiti = document.getElementById("lista-preferiti");

function creaCardBase(
  squadra,
  classiColonna = ["col-12", "col-md-6", "col-lg-4"],
  mostraLogo = true,
  mostraSottotitolo = true,
) {
  const col = document.createElement("div");
  col.classList.add(...classiColonna);

  const card = document.createElement("div");
  card.classList.add("card");
  col.appendChild(card);

  if (mostraLogo) {
    const img = document.createElement("img");
    img.src = squadra.logo;
    img.classList.add("card-img-top");
    card.appendChild(img);
  }

  const cardBody = document.createElement("div");
  cardBody.classList.add(
    "card-body",
    "d-flex",
    "flex-column",
    "align-items-center",
  );
  card.appendChild(cardBody);

  const titolo = document.createElement("h5");
  titolo.classList.add("card-title", "text-center");
  if (!mostraSottotitolo) {
    titolo.classList.add("testo-header", "mb-5");
  }
  titolo.textContent = squadra.nome;
  cardBody.appendChild(titolo);

  if (mostraSottotitolo) {
    const sottotitolo = document.createElement("p");
    sottotitolo.classList.add("card-text", "text-center", "text-muted");
    sottotitolo.textContent = squadra.lega + " — " + squadra.paese;
    cardBody.appendChild(sottotitolo);
  }

  return { col, card, cardBody };
}
