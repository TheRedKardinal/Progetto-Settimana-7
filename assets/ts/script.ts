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
