"use strict";
// INTERFACCE
// CLASSI
class Squadra {
    constructor(idTeam, strTeam, strTeamBadge, strLeague, strCountry) {
        this.id = idTeam;
        this.nome = strTeam;
        this.logo = strTeamBadge;
        this.lega = strLeague;
        this.paese = strCountry;
    }
}
class Evento {
    constructor(idEvent, dateEvent, strHomeTeam, strAwayTeam, intHomeScore, intAwayScore) {
        this.id = idEvent;
        this.data = dateEvent;
        this.casa = strHomeTeam;
        this.trasferta = strAwayTeam;
        this.punteggioCasa = intHomeScore;
        this.punteggioTrasferta = intAwayScore;
    }
    dataPartita() {
        const parteData = this.data.split("-");
        return parteData[2] + "/" + parteData[1] + "/" + parteData[0];
    }
    punteggioFormattato() {
        if (this.punteggioCasa === null) {
            return "Da giocare";
        }
        return this.punteggioCasa + " - " + this.punteggioTrasferta;
    }
}
async function cercaSquadre(query) {
    try {
        const squadra = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${query}`);
        const dati = await squadra.json();
        if (dati.teams === null) {
            return "Nessuna squadra corrisponde alla ricerca";
        }
        const squadre = dati.teams.map((item) => new Squadra(item.idTeam, item.strTeam, item.strTeamBadge, item.strLeague, item.strCountry));
        return squadre;
    }
    catch (errore) {
        console.error(errore);
        return "Errore durante la ricerca, riprova più tardi.";
    }
}
async function caricaDettagli(idTeam) {
    try {
        const [rispostaProssimi, rispostaUltimi] = await Promise.all([
            fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${idTeam}`),
            fetch(`https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${idTeam}`),
        ]);
        const datiProssimi = await rispostaProssimi.json();
        const datiUltimi = await rispostaUltimi.json();
        const prossimi = datiProssimi.events === null
            ? []
            : datiProssimi.events.map((item) => new Evento(item.idEvent, item.dateEvent, item.strHomeTeam, item.strAwayTeam, item.intHomeScore, item.intAwayScore));
        const ultimi = datiUltimi.results === null
            ? []
            : datiUltimi.results.map((item) => new Evento(item.idEvent, item.dateEvent, item.strHomeTeam, item.strAwayTeam, item.intHomeScore, item.intAwayScore));
        return { prossimi, ultimi };
    }
    catch (errore) {
        console.error(errore);
        return "Errore durante la ricerca, riprova più tardi.";
    }
}
// STATO
let preferiti = JSON.parse(localStorage.getItem("preferiti") ?? "[]");
function salvaPreferiti() {
    localStorage.setItem("preferiti", JSON.stringify(preferiti));
}
function isPreferita(idSquadra) {
    return preferiti.some((p) => p.id === idSquadra);
}
function aggiungiPreferito(squadra) {
    if (isPreferita(squadra.id))
        return;
    preferiti.push(squadra);
    salvaPreferiti();
    renderPreferiti();
    renderSquadraFissa();
}
function rimuoviPreferito(idSquadra) {
    preferiti = preferiti.filter((p) => p.id !== idSquadra);
    salvaPreferiti();
    renderPreferiti();
    renderSquadraFissa();
}
// RENDER
const contenitoreSquadre = document.getElementById("lista-squadre");
const contenitorePreferiti = document.getElementById("lista-preferiti");
function creaCardBase(squadra, classiColonna = ["col-12", "col-md-6", "col-lg-4"], mostraLogo = true, mostraSottotitolo = true) {
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
    cardBody.classList.add("card-body", "d-flex", "flex-column", "align-items-center");
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
function renderEventi(contenitore, eventi) {
    contenitore.replaceChildren();
    if (eventi.length === 0) {
        const vuoto = document.createElement("p");
        vuoto.classList.add("fst-italic", "text-muted");
        vuoto.textContent = "Nessun evento in programma";
        contenitore.appendChild(vuoto);
        return;
    }
    eventi.forEach((evento) => {
        const riga = document.createElement("div");
        riga.classList.add("mb-2", "pb-2", "border-bottom");
        const data = document.createElement("div");
        data.classList.add("text-muted", "small");
        data.textContent = evento.dataPartita();
        riga.appendChild(data);
        const partita = document.createElement("div");
        partita.classList.add("d-flex", "justify-content-between", "align-items-center");
        const squadre = document.createElement("span");
        squadre.classList.add("fw-bold");
        squadre.textContent = evento.casa + " vs " + evento.trasferta;
        partita.appendChild(squadre);
        if (evento.punteggioCasa !== null) {
            const badge = document.createElement("span");
            badge.classList.add("badge", "bg-success");
            badge.textContent = evento.punteggioFormattato();
            partita.appendChild(badge);
        }
        riga.appendChild(partita);
        contenitore.appendChild(riga);
    });
}
function creaColonneEventi(cardBody) {
    const righe = document.createElement("div");
    righe.classList.add("row", "w-100");
    cardBody.appendChild(righe);
    const colProssimi = document.createElement("div");
    colProssimi.classList.add("col-eventi");
    const titoloProssimi = document.createElement("h6");
    titoloProssimi.classList.add("titolo-eventi");
    titoloProssimi.textContent = "Prossimi eventi";
    const listaProssimi = document.createElement("div");
    colProssimi.appendChild(titoloProssimi);
    colProssimi.appendChild(listaProssimi);
    const colUltimi = document.createElement("div");
    colUltimi.classList.add("col-eventi");
    const titoloUltimi = document.createElement("h6");
    titoloUltimi.classList.add("titolo-eventi");
    titoloUltimi.textContent = "Ultimi risultati";
    const listaUltimi = document.createElement("div");
    colUltimi.appendChild(titoloUltimi);
    colUltimi.appendChild(listaUltimi);
    righe.appendChild(colProssimi);
    righe.appendChild(colUltimi);
    return { listaProssimi, listaUltimi };
}
async function popolaEventi(idSquadra, listaProssimi, listaUltimi) {
    const dettagli = await caricaDettagli(idSquadra);
    if (typeof dettagli === "string") {
        listaProssimi.textContent = dettagli;
        listaUltimi.textContent = dettagli;
        return;
    }
    renderEventi(listaProssimi, dettagli.prossimi);
    renderEventi(listaUltimi, dettagli.ultimi);
}
const contenitoreSquadraFissa = document.getElementById("squadra-fissa");
async function renderSquadraFissa() {
    contenitoreSquadraFissa.replaceChildren();
    if (preferiti.length === 0) {
        const p = document.createElement("p");
        p.classList.add("text-center", "text-muted");
        p.textContent = "Aggiungi una squadra ai preferiti per vederla qui.";
        contenitoreSquadraFissa.appendChild(p);
        return;
    }
    const squadra = preferiti[0];
    const { col, cardBody } = creaCardBase(squadra, ["col-12"], false, false);
    contenitoreSquadraFissa.appendChild(col);
    const { listaProssimi, listaUltimi } = creaColonneEventi(cardBody);
    await popolaEventi(squadra.id, listaProssimi, listaUltimi);
}
function renderPreferiti() {
    contenitorePreferiti.replaceChildren();
    preferiti.forEach((squadra) => {
        const { col, cardBody } = creaCardBase(squadra);
        const bottone = document.createElement("button");
        bottone.classList.add("btn", "btn-primary", "w-100");
        bottone.innerHTML = '<i class="bi bi-trash-fill"></i> Rimuovi';
        bottone.addEventListener("click", () => rimuoviPreferito(squadra.id));
        cardBody.appendChild(bottone);
        contenitorePreferiti.appendChild(col);
    });
}
async function renderSquadre(squadre) {
    contenitoreSquadre.replaceChildren();
    if (typeof squadre === "string") {
        const p = document.createElement("p");
        p.textContent = squadre;
        p.classList.add(...(squadre.includes("Errore")
            ? ["alert", "alert-danger", "text-center"]
            : ["text-center"]));
        contenitoreSquadre.appendChild(p);
        return;
    }
    squadre.forEach(async (squadra) => {
        const { col, cardBody } = creaCardBase(squadra, ["col-12"]);
        contenitoreSquadre.appendChild(col);
        const bottone = document.createElement("button");
        bottone.classList.add("btn", "btn-aggiungi", "w-100", "mb-2");
        bottone.textContent = isPreferita(squadra.id)
            ? "Già nei preferiti"
            : "Aggiungi ai preferiti";
        bottone.disabled = isPreferita(squadra.id);
        bottone.addEventListener("click", () => {
            aggiungiPreferito(squadra);
            bottone.textContent = "Già nei preferiti";
            bottone.disabled = true;
        });
        cardBody.appendChild(bottone);
        const { listaProssimi, listaUltimi } = creaColonneEventi(cardBody);
        await popolaEventi(squadra.id, listaProssimi, listaUltimi);
    });
}
// EVENTI
const form = document.getElementById("ricerca");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = document.getElementById("search")
        .value;
    document.getElementById("spinner-ricerca").hidden = false;
    contenitoreSquadre.replaceChildren();
    const risultato = await cercaSquadre(query);
    document.getElementById("spinner-ricerca").hidden = true;
    renderSquadre(risultato);
});
renderPreferiti();
renderSquadraFissa();
