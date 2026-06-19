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
        const squadre = dati.teams.map(item => new Squadra(item.idTeam, item.strTeam, item.strTeamBadge, item.strLeague, item.strCountry));
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



// === Eventi ===
