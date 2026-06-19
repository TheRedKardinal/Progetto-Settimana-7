// SportsHub — Week Project Settimana VII
//
// Devi fare 4 cose per la Versione Base:
// 1. Definire le classi Squadra ed Evento (mappano i dati di TheSportsDB)
// 2. Funzione async cercaSquadre(query) che chiama /searchteams.php
// 3. Funzione async caricaDettagli(idTeam) che chiama in parallelo
//    eventsnext.php + eventslast.php usando Promise.all
// 4. Render dinamico: card squadre, lista prossimi eventi, lista risultati
//
// Endpoint base: https://www.thesportsdb.com/api/v1/json/3/
// Il `3` nell'URL è la chiave API pubblica di test di TheSportsDB: gratis, non serve registrarsi.
//
// Per le versioni Intermedia/Avanzata: localStorage preferiti, debounce, Promise.all multi.


// === Classi ===
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
        const parteData = this.data.split('-');
        return parteData[2] + '/' + parteData[1] + '/' + parteData[0];
    }

    punteggioFormattato() {
        if (this.punteggioCasa === null) {
            return 'Da giocare';
        }
        return this.punteggioCasa + ' - ' + this.punteggioTrasferta;
    }
}
// === API ===
async function cercaSquadre(query) {
    try {
        const squadra = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${query}`);
        const dati = await squadra.json();
        if (dati.teams === null) {
            return 'Nessuna squadra corrisponde alla ricerca';
        }
        const squadre = dati.teams.map(item => new Squadra(item.idTeam, item.strTeam, item.strBadge, item.strLeague, item.strCountry));
        return squadre;
    } catch (errore) {
        console.error(errore);
        return 'Errore durante la ricerca, riprova più tardi.';
    }
}

async function caricaDettagli(idTeam) {
    try {
        const [rispostaProssimi, rispostaUltimi] = await Promise.all([
            fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${idTeam}`),
            fetch(`https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${idTeam}`)
        ]);
        const datiProssimi = await rispostaProssimi.json();
        const datiUltimi = await rispostaUltimi.json();
        const prossimi = datiProssimi.events === null
            ? []
            : datiProssimi.events.map(item => new Evento(item.idEvent, item.dateEvent, item.strHomeTeam, item.strAwayTeam, item.intHomeScore, item.intAwayScore));
        const ultimi = datiUltimi.results === null
            ? []
            : datiUltimi.results.map(item => new Evento(item.idEvent, item.dateEvent, item.strHomeTeam, item.strAwayTeam, item.intHomeScore, item.intAwayScore));
        return { prossimi, ultimi };
    } catch (errore) {
        console.error(errore);
        return 'Errore durante la ricerca, riprova più tardi.';
    }

}
// === Stato ===



// === Render ===
const contenitoreSquadre = document.getElementById('lista-squadre');

function renderSquadre(squadre) {
    contenitoreSquadre.replaceChildren();
    if (typeof squadre === 'string') {
        const p = document.createElement('p');
        p.textContent = squadre;
        p.classList.add('text-center');
        contenitoreSquadre.appendChild(p);
        return;
    }

    squadre.forEach(squadra => {
        const col = document.createElement('div');
        col.classList.add('col-12', 'col-md-6', 'col-lg-4');

        const card = document.createElement('div');
        card.classList.add('card');

        col.appendChild(card);
        contenitoreSquadre.appendChild(col);

        const img = document.createElement('img');
        img.src = squadra.logo;
        img.classList.add('card-img-top');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body', "d-flex", "flex-column", "align-items-center");

        const titolo = document.createElement('h5');
        titolo.classList.add('card-title', 'text-center');
        titolo.textContent = squadra.nome;

        const sottotitolo = document.createElement('p');
        sottotitolo.classList.add('card-text', 'text-center');
        sottotitolo.textContent = squadra.lega + '-' + squadra.paese;

        const bottone = document.createElement('button');
        bottone.classList.add('btn', 'btn-primary', 'w-100');
        bottone.textContent = 'Vedi dettagli';
        bottone.addEventListener('click', () => caricaDettagli(squadra.id));

        cardBody.appendChild(titolo);
        cardBody.appendChild(sottotitolo);
        cardBody.appendChild(bottone);
        card.appendChild(img);
        card.appendChild(cardBody);
    });
}


// === Eventi ===
const form = document.getElementById('ricerca');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('search').value;
    const risultato = await cercaSquadre(query);
    renderSquadre(risultato);
})