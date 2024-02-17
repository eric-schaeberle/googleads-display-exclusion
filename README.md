# Google Ads Script: Automatischer Ausschluss von leistungsschwachen Display-Placements

Das Google Ads Display Exclusion Script ist ein automatisiertes Tool zur Verbesserung der Effizienz von Google Ads Display-Kampagnen. Durch die Identifizierung und den Ausschluss ineffizienter Platzierungen, die definierte Kriterien wie minimale Impressionen, CTR (Click-Through-Rate), Konversionen und CPC (Cost per Click) nicht erfüllen, zielt dieses Skript darauf ab, die Kampagnenleistung zu steigern und Werbekosten zu reduzieren.

## Hauptfunktionen
### Automatische Identifizierung ineffizienter Platzierungen: 
Fokussiert sich auf Platzierungen mit mindestens 200 Impressions, keiner oder niedriger Conversion-Rate, die einen bestimmten minimalen CTR und CPC überschreiten.

### Ausschluss von Platzierungen: 
Fügt die identifizierten Platzierungen einer Ausschlussliste hinzu, um zukünftige Impressionen zu verhindern.

### Flexibilität: 
Ermöglicht die Anpassung der Mindestwerte für Impressions, CTR, Konversionen und CPC sowie die Auswahl des Berichtszeitraums.

### Inkludierung pausierter Kampagnen: 
Optionale Überprüfung pausierter Kampagnen zur Verbesserung der zukünftigen Kampagnenleistung.

## Konfiguration
Vor der Nutzung des Skripts sind einige Konfigurationen erforderlich:
- Google Sheet URL: Die URL des Google Sheets, das die erlaubten Domains und Kanäle enthält.
- Tabellenname: Der Name des Tabs im Google Sheet, falls geändert.
- Mindestwerte: Definieren Sie die Mindestwerte für Impressions, CTR, Konversionen und CPC.
- Berichtszeitraum: Wählen Sie den gewünschten Berichtszeitraum aus den verfügbaren Optionen.

```javascript
var spreadsheetUrl =
  "https://docs.google.com/spreadsheets/d/..."; //put the sheet url here where you have put the allowed domains and channels.
var tabName = "Sheet1"; //put the tab name here if you have changed it in the google sheet
var minimumImpressions = 200; // minimum impressions to check a placement
var minimumCTR = 1; // minimum ctr to not exclude a placement
var minimumConversions = 1; // minimum conversion to not exclude a placement
var minimumCPC = 0.1; //minimum CPC to exclude a placement
var reportingPeriod = "ALL_TIME"; // you can put "TODAY", "YESTERDAY", "LAST_7_DAYS", "THIS_WEEK_SUN_TODAY", "LAST_WEEK", "LAST_14_DAYS", "LAST_30_DAYS", "LAST_BUSINESS_WEEK", "LAST_WEEK_SUN_SAT", "THIS_MONTH", "LAST_MONTH", "ALL_TIME"
var includePausedCampaigns = true; // set to true to also check the paused display campaigns. Set to false to skip paused campaigns
var applyExclusionList = true; // set to tur if you wan to apply the newly. create exclusion list to campaign it was created for
```

## Nutzung
Um das Skript zu verwenden, führen Sie die folgenden Schritte aus:

1. Öffnen Sie Ihre Google Ads-Konto und navigieren Sie zum Bereich "Bulk-Aktionen" > "Skripte".
2. Erstellen Sie ein neues Skript und fügen Sie den Code ein.
3. Passen Sie die Konfigurationsvariablen gemäß Ihren Anforderungen an.
4. Autorisieren Sie das Skript und planen Sie regelmäßige Ausführungen, um die Kampagneneffizienz kontinuierlich zu verbessern.
