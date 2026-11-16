# Offene Daten zum Übergang von der Bundeswehr ins Zivilleben

Offene Datensätze zu Berufsförderungsdienst (BFD), Förderungsdauer und Kostenhöchstbetrag, Übergangsgebührnissen, Dienstzeitende, Weiterbildung, Studium und Gründung nach der Bundeswehr. Jede Tabelle der Studien steht als CSV mit Fundstelle, die Quellen je Studie in `quellen.csv`. Die Reports mit Methode und Einordnung liegen auf [karriere-nach-der-bundeswehr.de/studien-reports](https://karriere-nach-der-bundeswehr.de/studien-reports/).

Herausgeber: Karriere nach der Bundeswehr (https://karriere-nach-der-bundeswehr.de). Spiegel: [Kaggle](https://www.kaggle.com/datasets/nachderbundeswehr/bundeswehr-dienstzeitende-und-bfd-daten-2026) · [Hugging Face](https://huggingface.co/datasets/karriere-nach-der-bundeswehr/bundeswehr-dienstzeitende-bfd-daten-2026). Lizenz der Daten: [CC BY 4.0](LICENSE). Code des Rechners: MIT. Stand: 2026-11-16.

Kein Angebot der Bundeswehr. Über Förderansprüche entscheidet der BFD im Einzelfall.

## BFD-Anspruch nach Dienstjahren

[bfd-anspruch-nach-dienstjahren.csv](daten/bfd-anspruch-nach-dienstjahren.csv): Förderungsdauer in Monaten und Kostenhöchstbetrag in Euro je volle Dienstjahre (Rechtsstand SVG und BFöV seit 01.01.2026). Ohne Minderungen nach § 7 Abs. 6 bis 9 SVG. Der vollständige Rechner mit Übergangsgebührnissen, Übergangsbeihilfe und Nutzungsfrist liegt in [rechner/bfd-rechner.js](rechner/bfd-rechner.js) und online auf [https://karriere-nach-der-bundeswehr.de](https://karriere-nach-der-bundeswehr.de/).

## Studien

| Studie | Tabellen | Zeilen | Report | DOI (Zenodo) |
|---|---|---|---|---|
| [Arbeitslos nach der Bundeswehr in Zahlen](daten/arbeitslos-nach-der-bundeswehr-2026/) | 5 | 32 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/arbeitslos-nach-der-bundeswehr-2026/) | [10.5281/zenodo.24281266](https://doi.org/10.5281/zenodo.24281266) |
| [Berufssoldaten und BO 41 in Zahlen](daten/berufssoldaten-und-bo-41-2026/) | 4 | 23 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/berufssoldaten-und-bo-41-2026/) | [10.5281/zenodo.24281271](https://doi.org/10.5281/zenodo.24281271) |
| [BFD-Budget in Zahlen 2026](daten/bfd-budget-atlas-2026/) | 4 | 34 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/bfd-budget-atlas-2026/) | [10.5281/zenodo.24281275](https://doi.org/10.5281/zenodo.24281275) |
| [BFD-Kurse und Standorte 2026](daten/bfd-kurse-und-standorte-2026/) | 7 | 58 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/bfd-kurse-und-standorte-2026/) | [10.5281/zenodo.24281279](https://doi.org/10.5281/zenodo.24281279) |
| [Berufsförderung in Zahlen 2026](daten/dienstzeitende-report-2026/) | 4 | 27 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/dienstzeitende-report-2026/) | [10.5281/zenodo.24281284](https://doi.org/10.5281/zenodo.24281284) |
| [Gründungen von Ex-Soldaten 2026](daten/gruenden-nach-der-bundeswehr-2026/) | 3 | 18 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/gruenden-nach-der-bundeswehr-2026/) | [10.5281/zenodo.24281290](https://doi.org/10.5281/zenodo.24281290) |
| [Bundesländer-Vergleich 2026](daten/nach-der-bundeswehr-in-den-bundeslaendern-2026/) | 6 | 69 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/nach-der-bundeswehr-in-den-bundeslaendern-2026/) | [10.5281/zenodo.24281292](https://doi.org/10.5281/zenodo.24281292) |
| [Neuer Wehrdienst in Zahlen 2026](daten/neuer-wehrdienst-2026/) | 4 | 23 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/neuer-wehrdienst-2026/) | [10.5281/zenodo.24281294](https://doi.org/10.5281/zenodo.24281294) |
| [Personalstärke der Bundeswehr 2026](daten/personalmonitor-bundeswehr-2026/) | 6 | 26 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/personalmonitor-bundeswehr-2026/) | [10.5281/zenodo.24281298](https://doi.org/10.5281/zenodo.24281298) |
| [Studium von Ex-Soldaten 2026](daten/studium-nach-der-bundeswehr-2026/) | 4 | 16 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/studium-nach-der-bundeswehr-2026/) | [10.5281/zenodo.24281301](https://doi.org/10.5281/zenodo.24281301) |
| [Übergangsgebührnisse-Statistik 2026](daten/uebergangsgebuehrnisse-report-2026/) | 4 | 24 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/uebergangsgebuehrnisse-report-2026/) | [10.5281/zenodo.24281304](https://doi.org/10.5281/zenodo.24281304) |
| [Weiterbildungsmarkt für Soldaten 2026](daten/weiterbildungsmarkt-fuer-soldaten-2026/) | 6 | 37 | [Report](https://karriere-nach-der-bundeswehr.de/studien-reports/weiterbildungsmarkt-fuer-soldaten-2026/) | [10.5281/zenodo.24281307](https://doi.org/10.5281/zenodo.24281307) |

Alle CSV-Dateien: UTF-8, Komma als Trennzeichen, erste Zeile = Spaltennamen, Werte wie im Report (deutsche Zahlenschreibweise).

## Zitieren

Jede Studie hat eine eigene DOI auf Zenodo (Spalte DOI oben). Gesamtzitat:

Karriere nach der Bundeswehr (2026): Offene Daten zum Übergang von der Bundeswehr ins Zivilleben. https://github.com/karriere-nach-der-bundeswehr/offene-daten

## Hinweise

- Nur Werte aus öffentlich zugänglichen Primärquellen (Gesetze, Bundeshaushalt, Bundestagsdrucksachen, Statistik der Bundesagentur für Arbeit und weitere, siehe `quellen.csv`).
- Fehler gefunden? Bitte ein [Issue](https://github.com/karriere-nach-der-bundeswehr/offene-daten/issues) anlegen.
- Keine Rechtsberatung.
