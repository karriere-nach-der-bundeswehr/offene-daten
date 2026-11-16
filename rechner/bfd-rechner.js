/* BFD-Anspruchsrechner: Förderungsdauer, Kostenhöchstbetrag, Übergangsgebührnisse, Übergangsbeihilfe, Nutzungsfrist.
   Rechtsstand SVG und BFöV i. d. F. WDModG (BGBl. 2025 I Nr. 370), gültig seit 01.01.2026.
   Berechnet: § 7 Abs. 5, Minderungen nach § 7 Abs. 6 bis 9, § 7 Abs. 10 Satz 1 (soweit Gesetz und BF 02 tragen), § 16 Abs. 2, 3 und 5,
   § 19, § 20, § 104 SVG und § 16, § 19 BFöV. Nicht berechnet (Ausgabe „beim BFD erfragen“): Restanspruch nach § 21 SVG, § 7 Abs. 10 Satz 2,
   Abs. 11, Abs. 12 SVG, § 16 Abs. 2 Satz 3 SVG, Ermessen nach § 7 Abs. 4 Satz 2, § 16 Abs. 5, § 19 Abs. 6 SVG. Läuft im Browser und unter node (Test).
   Keine Datenübertragung, keine Cookies. Gleiche Datei in der Chrome-Erweiterung (dort Kopie). */
(function (root) {
  "use strict";
  // § 7 Abs. 5 SVG = § 16 Abs. 2 Satz 1 SVG (Monate) und § 19 Abs. 2 BFöV (Euro), Index = volle Dienstjahre − 1, ab 12 Jahren letzter Wert
  var MONATE = [1, 2, 3, 12, 18, 24, 30, 36, 42, 48, 54, 60];
  var KHB = [1200, 2400, 3600, 5000, 7000, 9000, 11000, 13000, 15000, 17000, 19000, 21000];
  var JE_MONAT = 333.33; // § 19 Abs. 2 Satz 2 BFöV
  var ZAW = { kein: 0, unter3: 0, "3bis12": 3, ueber12: 9 }; // § 7 Abs. 7 Satz 1 bis 3 SVG

  function zahl(v, min, max) {
    var t = String(v == null ? "" : v).trim().replace(/\s|€/g, "");
    if (t.indexOf(",") >= 0) t = t.replace(/\./g, "").replace(",", "."); // 1.234,56
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, ""); // 3.500 = dreitausendfünfhundert
    var n = t === "" ? NaN : Number(t);
    return isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
  }
  function kommaZahl(n) { return String(Math.round(n * 10) / 10).replace(".", ","); }
  function eur(n) {
    var ganz = Math.abs(n - Math.round(n)) < 0.005;
    return n.toLocaleString("de-DE", { minimumFractionDigits: ganz ? 0 : 2, maximumFractionDigits: ganz ? 0 : 2 }) + " €";
  }
  function cent(n) { return Math.round(n * 100 + 1e-6) / 100; } // kaufmännisch auf Cent, die Gesetze nennen keine eigene Rundung
  function monate(n) { return kommaZahl(n) + (n === 1 ? " Monat" : " Monate"); }

  // Übergangsbeihilfe-Faktor nach Wehrdienstzeit in Monaten (§ 19 Abs. 2 SVG)
  function uebFaktor(w) {
    if (w < 18) return 1.5;
    if (w < 24) return 1.8;
    if (w < 48) return 2;
    var j = Math.floor(w / 12);
    return j >= 25 ? 15 : 4 + 0.5 * (j - 4);
  }

  // Datum + n Jahre; 29.02. wird im Nicht-Schaltjahr zum 28.02.
  function plusJahre(iso, n) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return null;
    var j = +m[1] + n, mo = +m[2], t = +m[3];
    var letzter = new Date(Date.UTC(j, mo, 0)).getUTCDate();
    t = Math.min(t, letzter);
    return j + "-" + (mo < 10 ? "0" : "") + mo + "-" + (t < 10 ? "0" : "") + t;
  }
  function deDatum(iso) { var p = iso.split("-"); return p[2] + "." + p[1] + "." + p[0]; }

  var ERFRAGEN = "bitte beim BFD erfragen";
  var ERFRAGEN_V = "bei der für deine Versorgung zuständigen Stelle erfragen"; // § 16 Abs. 6 SVG „zuständige Stelle“, nicht zwingend der BFD
  var WERT_ERFRAGEN = "beim BFD erfragen";
  var WERT_ERFRAGEN_V = "bei der Versorgungsstelle erfragen";
  var FAKTOR_104 = 0.9901; // § 104 Satz 3 SVG, nur für Übergangsgebührnisse (und Ausgleichsbezüge)

  function berechne(e) {
    e = e || {};
    // Wehrdienstzeit in vollen Monaten: festgesetzte Zeit, bei Entlassung auf eigenen Antrag die geleistete (§ 3 Abs. 1 SVG).
    // Abrunden, weil § 7 Abs. 5 SVG auf „x und weniger als y Jahre“ abstellt; Monate über 11 zählen als weitere Jahre.
    var w = Math.min(480, Math.floor(zahl(e.jahre, 0, 40)) * 12 + Math.floor(zahl(e.monate, 0, 480)));
    var j = Math.floor(w / 12);
    var gesamtEingabe = zahl(e.gesamtJahre, 0, 45);
    var vordienst = gesamtEingabe > w / 12 + 0.01; // frühere Dienstverhältnisse, § 21 SVG
    var gesamtZuKlein = gesamtEingabe > 0 && gesamtEingabe < w / 12 - 0.01;
    var gesamt = Math.max(gesamtEingabe, w / 12);
    var gj = Math.floor(gesamt);
    var ab20 = gesamt >= 20;
    var antrag = e.ende === "antrag"; // Entlassung auf eigenen Antrag (§ 55 Abs. 3 SG)
    var scheinEingabe = e.schein === "e" || e.schein === "z" ? e.schein : "keiner";
    var scheinMoeglich = w >= 144 && e.ende !== "antrag"; // § 13 Abs. 1 Nr. 1, Abs. 2 SVG (Dienstunfähigkeit Nr. 2 hier nicht gerechnet)
    var schein = scheinMoeglich ? scheinEingabe : "keiner";
    var bez = zahl(e.bezuege, 0, 20000);
    var studium = !!e.studium;
    var r = { w: w, anspruch: false, foerderMonate: 0, khb: 0, khbUnsicher: false, uegnMonate: 0, uegn75: null, bildungszuschuss: null, uegn100: null,
              uebFaktor: 0, ueb: null, frist: null, erfragen: [], zeilen: [], hinweise: [] };
    var Z = function (titel, wert, detail, quelle) {
      if (wert === WERT_ERFRAGEN || wert === WERT_ERFRAGEN_V) r.erfragen.push(titel);
      r.zeilen.push({ titel: titel, wert: wert, detail: detail || "", quelle: quelle });
    };
    var H = function (text, quelle) { r.hinweise.push({ text: text, quelle: quelle }); };
    var jahrText = function (n) { return n + (n === 1 ? " Jahr" : " Jahren"); };

    // Minderungen § 7 Abs. 7 bis 9 SVG, ab 20 Jahren Gesamtdienstzeit nur zur Hälfte (§ 7 Abs. 6 Satz 2 SVG)
    var minderung = (ZAW[e.zaw] || 0) + (e.fortbildung ? 6 : 0) + (e.fahrlehrer ? 6 : 0);
    if (ab20) minderung = minderung / 2;
    var zuschlag = gesamt >= 25 ? 3000 : gesamt >= 20 ? 2000 : gesamt >= 15 ? 1000 : 0; // § 19 Abs. 2 Satz 3 BFöV
    var i = Math.max(0, Math.min(j, 12) - 1);
    var regelMonate = Math.max(0, MONATE[i] - minderung); // § 7 Abs. 5 bis 9 und § 16 Abs. 2 Satz 1 und 4 SVG

    // Studium auf Kosten des Bundes, § 7 Abs. 10 Satz 1 SVG: Wortlaut 12 Monate bei Abs. 5 Nr. 1 bis 8, 24 Monate bei Nr. 9.
    // BF 02: 12 Monate unter 12 Jahren, 24 ab 12 Jahren. Übereinstimmung nur bei 1 bis 8 Jahren; 9 Jahre Widerspruch; ab 10 Jahren nur BF 02.
    var stud = null;
    if (studium) {
      if (j >= 1 && j <= 3) stud = { monate: null, quelle: "unter4" }; // Wortlaut gäbe 12 Monate, mehr als ohne Studium; Verweis evtl. alte Nummerierung
      else if (j >= 4 && j <= 8) stud = { monate: 12, quelle: "gesetz" };
      else if (j === 9) stud = { monate: null, quelle: "widerspruch" };
      else if (j >= 10) stud = { monate: j < 12 ? 12 : 24, quelle: "bf02" };
    }

    // 1. Förderung nach § 7 SVG
    if (schein === "e") {
      Z("Förderungsdauer", "kein Anspruch", "Mit Eingliederungsschein besteht kein Anspruch auf Förderung nach § 7 SVG.", "§ 7 Abs. 1 Satz 1 SVG");
      Z("Kostenhöchstbetrag", "0 €", "Kein Bildungsbudget mit Eingliederungsschein.", "§ 7 Abs. 1 Satz 1 SVG");
    } else if (w < 12) {
      Z("Förderungsdauer", "kein Anspruch", "Der Anspruch setzt eine auf mindestens ein Jahr festgesetzte Wehrdienstzeit voraus. Freiwillig Wehrdienstleistende haben nach dem Dienst keinen Anspruch auf Förderung nach § 7 SVG.", "§ 7 Abs. 1 Satz 1 SVG");
      Z("Kostenhöchstbetrag", "0 €", "", "§ 7 Abs. 1 Satz 1 SVG");
    } else if (antrag && w < 48) {
      Z("Förderungsdauer", "kein Anspruch", "Bei Entlassung auf eigenen Antrag entsteht kein Anspruch auf Förderung nach § 7 SVG. Übergangsgebührnisse, an die eine Förderung im Ermessen anknüpfen könnte, gibt es in diesem Fall erst nach mindestens vier Jahren Wehrdienstzeit.", "§ 7 Abs. 4, § 16 Abs. 5 SVG");
      Z("Kostenhöchstbetrag", "0 €", "", "§ 7 Abs. 4 SVG");
    } else if (antrag) {
      r.foerderMonate = null; r.khb = null;
      Z("Förderungsdauer", WERT_ERFRAGEN, "Bei Entlassung auf eigenen Antrag entsteht kein Anspruch auf Förderung nach § 7 SVG. Bewilligt die Bundeswehr dir auf Antrag Übergangsgebührnisse, kann sie dich im Ermessen bis zur Dauer dieses Zeitraums fördern. Ob und wie lange, " + ERFRAGEN + ".", "§ 7 Abs. 4 Satz 2, § 16 Abs. 5 SVG");
      Z("Kostenhöchstbetrag", WERT_ERFRAGEN, "Hängt davon ab, ob und für wie lange eine Förderung im Ermessen bewilligt wird.", "§ 19 Abs. 2 BFöV");
    } else if (vordienst) {
      r.anspruch = true; r.foerderMonate = null; r.khb = null;
      var gi = Math.min(gj, 12) - 1;
      Z("Förderungsdauer", WERT_ERFRAGEN, "Mit früheren Dienstverhältnissen richtet sich der Anspruch nach der Gesamtdienstzeit. Ausgangswert nach " + jahrText(gj) + " sind bis zu " + monate(MONATE[gi]) +
        (minderung ? " vor Minderungen" : "") + ". Davon gehen die Förderungszeiten ab, die du aus dem früheren Dienstverhältnis schon hattest. Deinen Restanspruch " + ERFRAGEN + ".", "§ 21 Abs. 1 Satz 1 und 4, § 7 Abs. 5 SVG");
      Z("Kostenhöchstbetrag", WERT_ERFRAGEN, "Folgt aus der verbleibenden Förderungsdauer (333,33 € je Monat Abweichung), frühere Kostenerstattungen werden angerechnet." +
        (zuschlag ? " Der Zuschlag von " + eur(zuschlag) + " für " + gj + " Jahre Gesamtdienstzeit kommt dazu." : ""), "§ 19 Abs. 2 Satz 2, 3 und 5 BFöV");
    } else if (studium) {
      r.anspruch = true;
      if (!stud || stud.monate === null) {
        r.foerderMonate = null; r.khb = null;
        Z("Förderungsdauer", WERT_ERFRAGEN, (stud && stud.quelle === "unter4"
          ? "Für Studium auf Kosten des Bundes nennt der Gesetzeswortlaut 12 Monate auch unter vier Jahren Wehrdienstzeit, also mehr als ohne Studium. Der Verweis stammt vermutlich aus der alten Nummerierung. Den verbindlichen Wert "
          : "Nach neun Jahren Wehrdienstzeit nennt der Gesetzeswortlaut 24 Monate, die Broschüre BF 02 dagegen 12 Monate. Den verbindlichen Wert ") + ERFRAGEN + ".", "§ 7 Abs. 10 Satz 1 SVG" + (stud && stud.quelle === "unter4" ? "" : ", BF 02"));
        Z("Kostenhöchstbetrag", WERT_ERFRAGEN, "Hängt von der Förderungsdauer ab.", "§ 19 Abs. 2 BFöV");
      } else {
        r.foerderMonate = stud.monate;
        var bf02 = stud.monate === 12 ? 5000 : 9000;
        var rechn = Math.max(0, cent(KHB[i] + JE_MONAT * (stud.monate - MONATE[i])));
        r.khbUnsicher = j < 4 || minderung > 0 || stud.quelle === "bf02";
        var khbErfragen = j < 4 || minderung > 0;
        Z("Förderungsdauer", monate(r.foerderMonate) + (stud.quelle === "bf02" ? " laut BF 02" : ""),
          (stud.quelle === "gesetz"
            ? "Mit Studium auf Kosten des Bundes gelten nach " + jahrText(j) + " Wehrdienstzeit 12 Monate, so steht es im Gesetz und in der Broschüre BF 02."
            : "Der Gesetzeswortlaut nennt für das Studium auf Kosten des Bundes nur Wehrdienstzeiten bis unter zehn Jahren. Die Broschüre BF 02 nennt 12 Monate unter zwölf Jahren und 24 Monate ab zwölf Jahren. Den verbindlichen Wert " + ERFRAGEN + ".") +
          (minderung > 0 ? " Ob die Minderungen zusätzlich abgezogen werden, " + ERFRAGEN + "." : ""),
          "§ 7 Abs. 10 Satz 1 SVG" + (stud.quelle === "bf02" ? ", BF 02" : ""));
        if (khbErfragen) {
          r.khb = null;
          Z("Kostenhöchstbetrag", WERT_ERFRAGEN, "Die Rechnung nach § 19 Abs. 2 Satz 2 BFöV und die Angabe in BF 02 (" + eur(bf02) + ") passen in deinem Fall nicht zusammen. Den verbindlichen Betrag " + ERFRAGEN + ".", "§ 19 Abs. 2 BFöV, BF 02");
        } else if (stud.monate === 12 && Math.abs(rechn - 5000) < 1) {
          r.khb = 5000 + zuschlag; r.khbUnsicher = rechn !== 5000;
          Z("Kostenhöchstbetrag", eur(r.khb), "Laut BF 02 und der Tabelle in § 19 Abs. 2 BFöV (12 Monate = 5.000 €)." +
            (rechn !== 5000 ? " Rechnet man von " + eur(KHB[i]) + " mit 333,33 € je Monat herunter, ergeben sich " + eur(rechn) + ". Den genauen Betrag " + ERFRAGEN + "." : "") +
            (zuschlag ? " Plus " + eur(zuschlag) + " Zuschlag für " + gj + " Jahre Gesamtdienstzeit." : ""), "§ 19 Abs. 2 Satz 1 und 2 BFöV, BF 02");
        } else {
          r.khb = cent(rechn + zuschlag);
          Z("Kostenhöchstbetrag", eur(r.khb),
            eur(KHB[i]) + (stud.monate < MONATE[i] ? " minus " : " plus ") + "333,33 € für jeden Monat Abweichung von " + kommaZahl(MONATE[i]) + " Monaten" + ". BF 02 nennt gerundet " + eur(bf02) + "." +
            (zuschlag ? " Plus " + eur(zuschlag) + " Zuschlag für " + gj + " Jahre Gesamtdienstzeit." : "") +
            (stud.quelle === "bf02" ? " Verbindlichen Betrag " + ERFRAGEN + "." : ""),
            "§ 19 Abs. 2 Satz 2 und 3 BFöV");
        }
      }
    } else {
      r.anspruch = true;
      r.foerderMonate = regelMonate;
      r.khb = cent(Math.max(0, KHB[i] - JE_MONAT * minderung)) + zuschlag;
      Z("Förderungsdauer", monate(r.foerderMonate),
        "Bis zu " + monate(MONATE[i]) + " nach " + jahrText(j) + " Wehrdienstzeit" +
        (minderung ? ", minus " + monate(minderung) + " Minderung" + (ab20 ? " (ab 20 Jahren Gesamtdienstzeit nur zur Hälfte)" : "") : "") + ".",
        "§ 7 Abs. 5" + (minderung ? ", 6 bis 9" : "") + " SVG");
      Z("Kostenhöchstbetrag", eur(r.khb),
        "Für Lehrgangs- und Prüfungsgebühren und Ausbildungsmittel, Reisekosten kommen nach eigenen Regeln dazu." +
        (minderung ? " " + eur(KHB[i]) + " minus 333,33 € je Monat Minderung, auf den Cent gerundet." : "") +
        (zuschlag ? " Plus " + eur(zuschlag) + " Zuschlag für " + gj + " Jahre Gesamtdienstzeit." : ""),
        "§ 19 Abs. 1 und 2 BFöV");
    }

    // 2. Übergangsgebührnisse § 16 SVG, Bemessung mit Faktor 0,9901 (§ 104 SVG)
    var basis = cent(bez * FAKTOR_104);
    if (bez > 0) { r.uegn75 = cent(bez * FAKTOR_104 * 0.75); r.uegn100 = basis; r.bildungszuschuss = cent(bez * FAKTOR_104 * 0.25); } // jeder Wert einmal direkt gerundet, wie auf den Ratgeberseiten (Gesetz nennt keine Rundung) // Bildungszuschuss gehört zu § 16 Abs. 3, also auch mit 0,9901
    var betragText = bez > 0
      ? " Monatlich " + eur(r.uegn75) + " (Dienstbezüge mal 0,9901, davon 75 %). Während einer nach § 7 SVG geförderten Maßnahme in Vollzeitform kommt ein Bildungszuschuss von 25 % dazu, zusammen " + eur(r.uegn100) + ". Der Familienzuschlag zählt hier nur bis Stufe 1, Kinderanteile darin senken den Betrag."
      : " Gib deine letzten Dienstbezüge ein, dann rechnen wir die Monatsbeträge aus.";
    if (schein === "e") {
      Z("Übergangsgebührnisse", "keine", "Mit Eingliederungsschein gibt es statt Übergangsgebührnissen Ausgleichsbezüge.", "§ 17 Abs. 1 Satz 1 SVG");
    } else if (w < 12) {
      Z("Übergangsgebührnisse", "keine", "Übergangsgebührnisse gibt es erst ab einem Jahr Wehrdienstzeit.", "§ 16 Abs. 2 Satz 1 SVG");
    } else if (antrag && w < 48) {
      Z("Übergangsgebührnisse", "keine", "Bei Entlassung auf eigenen Antrag können Übergangsgebührnisse erst nach mindestens vier Jahren Wehrdienstzeit bewilligt werden.", "§ 16 Abs. 1 und 5 SVG");
    } else if (antrag) {
      r.uegnMonate = null;
      Z("Übergangsgebührnisse", WERT_ERFRAGEN_V, "Kein Anspruch, aber auf Antrag können sie bewilligt werden, soweit es übergangsweise zur Sicherung des Lebensunterhalts notwendig ist. Höchstens so lange und so hoch wie bei regulärem Dienstende, hier also bis zu " + (studium ? (stud && stud.monate ? monate(stud.monate) + " (Studium auf Kosten des Bundes)" : "der Förderungsdauer mit Studium, die du " + ERFRAGEN_V + " musst") : monate(regelMonate)) + "." + betragText.replace(" Monatlich", " Obergrenze monatlich"), "§ 16 Abs. 5 SVG");
    } else if (vordienst) {
      r.uegnMonate = null;
      Z("Übergangsgebührnisse", WERT_ERFRAGEN_V, "Der Bezugszeitraum richtet sich nach der Gesamtdienstzeit und verkürzt sich um die Zeit, für die du früher schon Übergangsgebührnisse bekommen hast. Früher zustehende Ausgleichsbezüge werden angerechnet." + betragText, "§ 21 Abs. 1 Satz 5 und 6, § 16 Abs. 3, § 104 SVG");
    } else if (studium && r.foerderMonate === null) {
      r.uegnMonate = null;
      Z("Übergangsgebührnisse", WERT_ERFRAGEN_V, "Mit Studium auf Kosten des Bundes so lange wie die Förderungsdauer, und die ist in deinem Fall offen." + betragText, "§ 16 Abs. 2 Satz 2 SVG");
    } else {
      r.uegnMonate = studium ? r.foerderMonate : regelMonate;
      var txt = studium ? "Mit Studium auf Kosten des Bundes so lange wie die Förderungsdauer."
        : (minderung ? "Verkürzt um die Minderung von " + monate(minderung) + "." : "Nach der Wehrdienstzeit.");
      if (bez > 0) txt += betragText + " Über die ganze Dauer bei 75 % zusammen " + eur(cent(r.uegn75 * r.uegnMonate)) + " brutto.";
      else txt += betragText;
      Z("Übergangsgebührnisse", monate(r.uegnMonate) + (studium && stud.quelle === "bf02" ? " laut BF 02" : ""), txt, "§ 16 Abs. 2, § 16 Abs. 3, § 104 SVG");
    }

    // 2b. Vollzeit oder Teilzeit: Bildungszuschuss nur in Vollzeit (§ 16 Abs. 3 Satz 3 SVG), Teilzeit verbraucht volle Laufzeit (§ 27 BFöV)
    var form = e.form || "offen", kurs = zahl(e.kursMonate, 0, 60);
    if (r.anspruch && typeof r.uegnMonate === "number" && r.uegnMonate > 0) {
      var vzText = "Vollzeit heißt regelmäßig an 4 Tagen pro Woche mit mindestens 25 Unterrichtsstunden zu 45 Minuten, bei Kursen unter 4 Tagen mindestens 6,25 Unterrichtsstunden pro Tag (§ 15 Abs. 4 BFöV). Gerechnet ist mit Kursbeginn direkt nach dem Dienstzeitende. Dann gibt es während des Kurses 100 % statt 75 %, solange du Übergangsgebührnisse bekommst.";
      var tzText = "In Teilzeit bleibt es bei 75 %, und der Kurs verbraucht trotzdem seine volle Laufzeit als Förderungszeit (§ 27 BFöV).";
      var zm = kurs ? Math.min(kurs, r.uegnMonate) : r.uegnMonate; // Zuschuss nur im Bezugszeitraum
      var plus = bez > 0 ? cent(r.bildungszuschuss * zm) : null;
      var rest = kurs && typeof r.foerderMonate === "number" ? " Ein Kurs über " + monate(kurs) + " verbraucht " + monate(Math.min(kurs, r.foerderMonate)) + " deiner Förderungszeit" + (kurs > r.foerderMonate ? ", mehr als dir zusteht" : ", übrig bleiben " + monate(r.foerderMonate - kurs)) + "." : "";
      var wert, detail;
      if (form === "voll") {
        wert = bez > 0 ? eur(r.uegn100) + " im Monat" : "100 %";
        detail = vzText + (plus !== null ? " Das sind " + eur(r.bildungszuschuss) + " Bildungszuschuss pro Monat, für " + monate(zm) + " zusammen " + eur(plus) + " brutto mehr." : " Gib deine letzten Dienstbezüge ein, dann rechnen wir den Betrag aus.") + rest;
      } else if (form === "teil") {
        wert = bez > 0 ? eur(r.uegn75) + " im Monat" : "75 %";
        detail = tzText + (plus !== null ? " In Vollzeit wären es " + eur(r.uegn100) + " im Monat, für " + monate(zm) + " zusammen " + eur(plus) + " brutto mehr." : "") + rest;
      } else {
        wert = bez > 0 ? eur(r.uegn100) + " statt " + eur(r.uegn75) : "100 % statt 75 %";
        detail = vzText + " " + tzText + (plus !== null ? " Unterschied für " + monate(zm) + " zusammen " + eur(plus) + " brutto." : "") + (kurs ? "" : " Gib die Kursdauer ein, dann rechnen wir den Unterschied für deinen Kurs aus.") + rest;
      }
      Z("Vollzeit oder Teilzeit", wert, detail, "§ 16 Abs. 3 Satz 3, § 104 SVG, § 15 Abs. 4, § 27 BFöV");
    }

    // 3. Übergangsbeihilfe § 19 SVG (bis sechs Monate § 20 SVG)
    var anteil = schein === "e" ? 0.25 : schein === "z" ? 0.5 : 1;
    var scheinText = schein === "e" ? " Mit Eingliederungsschein 25 % davon." : schein === "z" ? " Mit Zulassungsschein 50 % davon." : "";
    if (w === 0) {
      Z("Übergangsbeihilfe", "–", "Bitte gib deine Wehrdienstzeit ein.", "§ 19 SVG");
    } else if (antrag && w < 48) {
      Z("Übergangsbeihilfe", "keine", "Bei Entlassung auf eigenen Antrag gibt es Übergangsbeihilfe nur im Umfang bewilligter Übergangsgebührnisse, und die setzen mindestens vier Jahre voraus.", "§ 19 Abs. 1 und 6, § 20 SVG");
    } else if (antrag) {
      Z("Übergangsbeihilfe", WERT_ERFRAGEN_V, "Kein Anspruch. Werden Übergangsgebührnisse auf Antrag ganz oder teilweise bewilligt, gibt es die Übergangsbeihilfe im entsprechenden Umfang.", "§ 19 Abs. 1 und 6 SVG");
    } else if (vordienst) {
      r.uebFaktor = uebFaktor(gj * 12);
      Z("Übergangsbeihilfe", WERT_ERFRAGEN_V, "Ausgangswert nach " + jahrText(gj) + " Gesamtdienstzeit ist das " + String(r.uebFaktor).replace(".", ",") + "-fache der Dienstbezüge des letzten Monats." + scheinText +
        " Eine früher gezahlte Übergangsbeihilfe geht davon ab, ein früher zustehendes Entlassungsgeld wird angerechnet.", "§ 21 Abs. 1 Satz 1, 2 und 7, § 19 Abs. 2 SVG");
    } else if (w <= 6) {
      r.ueb = 105 * w;
      Z("Übergangsbeihilfe", eur(r.ueb), "Bis sechs Monate Wehrdienstzeit gibt es 105 € je vollem Monat statt eines Vielfachen der Dienstbezüge, für angefangene Monate 3,50 € je Tag (hier nicht eingerechnet). Lebst du mit Ehegatten, dem anderen Elternteil deines Kindes oder unterhaltsberechtigten Kindern zusammen, kommen 400 € beziehungsweise 200 € je Kind als Überbrückungszuschuss dazu.", "§ 20 SVG");
    } else {
      r.uebFaktor = uebFaktor(w);
      var fwdl = w < 12 ? " Das gilt nur für Soldaten auf Zeit, nicht für Freiwillig Wehrdienstleistende." : "";
      var faktorText = String(r.uebFaktor).replace(".", ",") + "-fach";
      if (bez > 0) {
        r.ueb = cent(bez * r.uebFaktor * anteil);
        Z("Übergangsbeihilfe", eur(r.ueb), faktorText + " der Dienstbezüge des letzten Monats, einmalig, steuerpflichtig." + scheinText + fwdl, "§ 19 Abs. 2" + (anteil < 1 ? " und 3" : "") + " SVG");
      } else {
        Z("Übergangsbeihilfe", faktorText, "Vielfaches der Dienstbezüge des letzten Monats, einmalig." + scheinText + fwdl + " Gib deine letzten Dienstbezüge ein, dann rechnen wir den Betrag aus.", "§ 19 Abs. 2" + (anteil < 1 ? " und 3" : "") + " SVG");
      }
    }

    // 4. Nutzungsfrist § 16 Abs. 1 BFöV, § 7 Abs. 6 Satz 3 SVG
    if (r.anspruch) {
      var jahre = ab20 ? 8 : 7;
      r.frist = plusJahre(e.dze, jahre);
      Z("Nutzungsfrist", r.frist ? deDatum(r.frist) : jahre + " Jahre nach Dienstende",
        "Bis dahin muss deine Maßnahme beginnen (" + jahre + " Jahre nach Dienstzeitende" + (ab20 ? ", weil du mindestens 20 Jahre Gesamtdienstzeit hast" : "") + "). Danach kann bis zur Förderungshöchstdauer weiter gefördert werden." +
        (r.frist ? "" : " Gib dein Dienstzeitende ein, dann rechnen wir das Datum aus."),
        "§ 16 Abs. 1 BFöV, § 7 Abs. 6 Satz 3 SVG");
    }

    // 5. Hinweise
    if (scheinEingabe !== "keiner" && !scheinMoeglich)
      H("Einen Eingliederungs- oder Zulassungsschein gibt es nur, wenn eine auf mindestens zwölf Jahre festgesetzte Wehrdienstzeit durch Ablauf endet, Ausnahmen bei Dienstunfähigkeit. Gerechnet wurde deshalb ohne Schein.", "§ 13 Abs. 1 und 2 SVG");
    if (gesamtZuKlein) H("Die Gesamtdienstzeit kann nicht kürzer sein als die Wehrdienstzeit. Gerechnet wurde mit " + kommaZahl(w / 12) + " Jahren.", "§ 21 SVG");
    if (antrag) H("Bei Entlassung auf eigenen Antrag zählt die tatsächlich geleistete Wehrdienstzeit, nicht die festgesetzte. Gib deshalb oben die Zeit bis zu deiner Entlassung ein.", "§ 3 Abs. 1 SVG");
    H("Mit Eingliederungsschein gibt es keine Förderung nach § 7 SVG und nur 25 % der Übergangsbeihilfe.", "§ 7 Abs. 1, § 19 Abs. 3 SVG");
    H("Den Antrag stellst du vor Beginn der Maßnahme, schriftlich oder elektronisch. Sonst gibt es höchstens eine anteilige Förderung ab Antragseingang.", "§ 17 Abs. 1 BFöV");
    H("Nicht genutztes Budget wird nicht ausgezahlt.", "§ 19 Abs. 2 BFöV");
    H("Gerechnet wird mit Dienstende durch Ablauf der festgesetzten Zeit oder auf eigenen Antrag. Bei Dienstunfähigkeit zählt die tatsächliche Wehrdienstzeit. Bei Entlassung nach nicht bestandener Laufbahnprüfung nach einem Laufbahnaufstieg gelten Sonderregeln. Andere Entlassungsgründe lassen den Anspruch nach § 7 SVG nicht entstehen. Deinen Fall dann " + ERFRAGEN + ".", "§ 3 Abs. 1, § 7 Abs. 4 Nr. 1 bis 3 SVG");
    if (r.anspruch && j < 4) H("Für Soldaten auf Zeit unter vier Jahren, die vor 2026 eingestellt wurden, fehlt eine eigene Übergangsregel. Welche Staffel gilt, " + ERFRAGEN + ".", "§ 7 Abs. 5 SVG");
    if (vordienst && !antrag) H("Du hast eine Gesamtdienstzeit über deiner jetzigen Wehrdienstzeit angegeben. Förderungsdauer, Budget, Übergangsgebührnisse und Übergangsbeihilfe rechnet der Rechner dann nicht aus, weil frühere Leistungen abgezogen werden. Deinen Restanspruch " + ERFRAGEN + ".", "§ 21 SVG, § 19 Abs. 2 BFöV");
    H("Nicht berechnet sind ein abgebrochenes Studium oder eine abgebrochene Fortbildung im Dienst, ein bei Einstellung gefordertes Studium, Militärmusikdienst, eine Freistellung vom Dienst und eine Verlängerung mit Verwendungseinkommen. Sie können Förderung und Übergangsgebührnisse verkürzen. Deine Werte dann " + ERFRAGEN + ".", "§ 7 Abs. 8, 10 Satz 2, 11 und 12, § 16 Abs. 2 Satz 3 SVG");
    H("Wurdest du vor dem 26.07.2012 Soldat auf Zeit oder hast du davor freiwilligen Wehrdienst nach altem Recht oder eine Eignungsübung angetreten, kann ohne Unterbrechung altes Recht gelten, mit Ausnahmen. Das rechnet der Rechner nicht, deine Werte " + ERFRAGEN + ".", "§ 126 Abs. 1 und 2 SVG");
    return r;
  }

  var api = { berechne: berechne, uebFaktor: uebFaktor, plusJahre: plusJahre, ERFRAGEN: ERFRAGEN, WERT_ERFRAGEN: WERT_ERFRAGEN, WERT_ERFRAGEN_V: WERT_ERFRAGEN_V };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.BFDRechner = api;
})(this);
