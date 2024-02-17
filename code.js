* @Email: eric.schaeberle@skaleup.de
* @Autor: Eric Schäberle
* @github-slug: googleads-display-exclusion
*
* Dieses Skript dient dazu, ineffiziente Platzierungen in Google Ads Display-Kampagnen automatisch zu identifizieren und auszuschließen. 
* Es fokussiert sich auf Platzierungen mit mindestens 200 Impressions und keiner oder geringer Conversion-Rate, 
* die einen bestimmten minimalen CTR und CPC überschreiten, und fügt sie einer Ausschlussliste hinzu. 
* Das Ziel ist die Steigerung der Kampagneneffizienz durch Reduzierung der Kosten für nicht performende Platzierungen.
*/

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


function main() {
  checkInput();
  var cpc = (minimumCPC/1000000).toFixed(2)
  if (includePausedCampaigns) {
    var campaignsToIncude = "AND campaign.status IN ('ENABLED', 'PAUSED')";
  } else {
    var campaignsToIncude = "AND campaign.status IN ('ENABLED')";
  }
  if (reportingPeriod == "ALL_TIME") {
    var query =
      "SELECT group_placement_view.target_url, group_placement_view.placement_type, campaign.id, campaign.name, metrics.average_cpc FROM group_placement_view WHERE campaign.advertising_channel_type = 'DISPLAY' AND group_placement_view.placement_type IN ('WEBSITE', 'YOUTUBE_CHANNEL') " +
      campaignsToIncude +
      " AND metrics.impressions >= " +
      minimumImpressions +
      " AND metrics.conversions < " +
      minimumConversions +
      " AND metrics.ctr < " +
      minimumCTR / 100+
      " AND metrics.average_cpc > "+cpc
  } else {
    var query =
      "SELECT group_placement_view.target_url, group_placement_view.placement_type, campaign.id, campaign.name, metrics.average_cpc FROM group_placement_view WHERE campaign.advertising_channel_type = 'DISPLAY' AND group_placement_view.placement_type IN ('WEBSITE', 'YOUTUBE_CHANNEL') " +
      campaignsToIncude +
      " AND metrics.impressions >= " +
      minimumImpressions +
      " AND metrics.conversions < " +
      minimumConversions +
      " AND metrics.ctr < " +
      minimumCTR / 100 +
      " AND metrics.average_cpc > "+cpc
      " AND segments.date DURING " +
      reportingPeriod;
  }
  var placementsReport = AdsApp.search(query);
  var placementsToExclude = {};
  while (placementsReport.hasNext()) {
    var placement = placementsReport.next();
    var campaignId = placement.campaign.id;
    var placementURL = placement.groupPlacementView.targetUrl
      ? placement.groupPlacementView.targetUrl
      : "";
    var type = placement.groupPlacementView.placementType;
    if (!placementsToExclude[campaignId]) {
      placementsToExclude[campaignId] = [[type, placementURL]];
    } else {
      placementsToExclude[campaignId].push([type, placementURL]);
    }
  }
  if (Object.keys(placementsToExclude).length > 0) {
    excludepalcements(placementsToExclude);
  }
}

function excludepalcements(placementsToExclude) {
  var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
  var sheet = spreadsheet.getSheetByName(tabName);
  var rawAllowedterms = sheet.getDataRange().getValues();
  var allowedterms = [];
  if (!rawAllowedterms[0][0].length == 0) {
    allowedterms = rawAllowedterms.reduce(function (accumulator, currentValue) {
      return accumulator.concat(currentValue);
    }, []);
  }
  var campaignIds = Object.keys(placementsToExclude);
  var campaignSelector = AdsApp.campaigns().withIds(campaignIds).get();
  while (campaignSelector.hasNext()) {
    var campaign = campaignSelector.next();
    var campaignId = campaign.getId();
    var campaignName = campaign.getName();

    var exclusionListName = campaignName+"_Display Exclusions_"+minimumCTR+"%"
    var sharedExcludedPlacementIterator = AdsApp.excludedPlacementLists()
    .withCondition("Name CONTAINS '"+exclusionListName+"'").get();
    if (sharedExcludedPlacementIterator.hasNext()) {
      var sharedExcludedPlacement = sharedExcludedPlacementIterator.next();
    }else{
      var excludedPlacementListOperation =
      AdsApp.newExcludedPlacementListBuilder()
          .withName(exclusionListName)
          .build();
          if (excludedPlacementListOperation.isSuccessful()) {
            var sharedExcludedPlacement = excludedPlacementListOperation.getResult();
            if (applyExclusionList) {
              campaign.addExcludedPlacementList(sharedExcludedPlacement)
            }
          }else{
            throw new Error(
              excludedPlacementListOperation.getErrors()
            );
          }
    }


    var campaignPlacements = placementsToExclude[campaignId];
    for (let i = 0; i < campaignPlacements.length; i++) {
      const placement = campaignPlacements[i];
      var pType = placement[0];
      var pURL = placement[1];
      // var gURL = placement[2];
      if (pType == "YOUTUBE_CHANNEL" && pURL.length > 0) {
        if (allowedterms.some((v) => pURL.includes(v))) {
          Logger.log(pURL + " skipped because in allowed list");
        } else {
          var videoExclusion = campaign
            .display()
            .newYouTubeChannelBuilder()
            .withChannelId(pURL.slice(20))
            .exclude();
          if (videoExclusion.isSuccessful()) {
            Logger.log(pURL + " excluded from campaign " + campaignName);
          } else {
            Logger.log(
              "could not exclude " +
                pURL +
                " because of ivalid URL or channel is not available."
            );
          }
        }
      } else if (pType == "WEBSITE" && pURL.length > 0) {
        if (allowedterms.some((v) => pURL.includes(v))) {
          Logger.log(pURL + " skipped because in allowed list");
        } else {
          sharedExcludedPlacement.addExcludedPlacement(pURL)
          Logger.log(pURL + " added to list " + exclusionListName);
        }
      }
    }
  }
}

function checkInput() {
  if (typeof minimumCTR != "number") {
    throw new Error(
      "Please put the minimum CTR in simple number format. you dont need to put % sign. For example (1, 1.2, 3.4)"
    );
  }
  if (typeof minimumImpressions != "number") {
    throw new Error(
      "Please put the minimum Impressions in simple number format. For example (50, 100, 150, 200)"
    );
  }
  if (typeof minimumConversions != "number") {
    throw new Error(
      "Please put the minimum conversions in simple number format. For example (1, 2, 3, 4)"
    );
  }
  var allowTimes = [
    "TODAY",
    "YESTERDAY",
    "LAST_7_DAYS",
    "THIS_WEEK_SUN_TODAY",
    "LAST_WEEK",
    "LAST_14_DAYS",
    "LAST_30_DAYS",
    "LAST_BUSINESS_WEEK",
    "LAST_WEEK_SUN_SAT",
    "THIS_MONTH",
    "LAST_MONTH",
    "ALL_TIME",
  ];
  if (!allowTimes.includes(reportingPeriod)) {
    throw new Error(
      'Invalid reporting period. please use one of the given periods. ("TODAY", "YESTERDAY", "LAST_7_DAYS", "THIS_WEEK_SUN_TODAY", "LAST_WEEK", "LAST_14_DAYS", "LAST_30_DAYS", "LAST_BUSINESS_WEEK", "LAST_WEEK_SUN_SAT", "THIS_MONTH", "LAST_MONTH", "ALL_TIME")'
    );
  }
  if (typeof includePausedCampaigns != "boolean") {
    throw new Error(
      "Invalid 'includePausedCampaigns' value. you can only put true or false"
    );
  }
  if (typeof applyExclusionList != "boolean") {
    throw new Error(
      "Invalid 'applyExclusionList' value. you can only put true or false"
    );
  }
}
