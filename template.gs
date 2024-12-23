function trackPets() {
  const SHEET_NAME = "SHEET NAME";
  const WEBHOOK_URL = "DISCORD WEBHOOK LINK";
  const BASE_IMAGE_URL = "https://ps99.biggamesapi.io/image/"; // leave as is
  const API_URL = "https://ps99.biggamesapi.io/api/exists"; // leave as is
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

  const response = UrlFetchApp.fetch(API_URL);
  const data = JSON.parse(response.getContentText()).data;

  trackSpecificPets(sheet, data, "Gargantuan", BASE_IMAGE_URL + "85770840304413", WEBHOOK_URL);
  trackSpecificPets(sheet, data, "Titanic Nutcracker Squirrel", BASE_IMAGE_URL + "72074096332299", WEBHOOK_URL);
  trackSpecificPets(sheet, data, "Titanic Grinch Cat", BASE_IMAGE_URL + "105600589075929", WEBHOOK_URL);
}

function trackSpecificPets(sheet, data, petName, imageURL, webhookURL) {
  const pets = data.filter(pet => pet.configData.id.includes(petName));
  const newTotalValue = pets.reduce((sum, pet) => sum + pet.value, 0);

  const lastRow = sheet.getLastRow();
  let petRow = -1;

  for (let i = 1; i <= lastRow; i++) {
    if (sheet.getRange(i, 1).getValue() === petName) {
      petRow = i;
      break;
    }
  }

  const oldValue = petRow !== -1 ? sheet.getRange(petRow, 2).getValue() : 0;
  const change = newTotalValue - oldValue;
  const estimatedTotal = pets.reduce((sum, pet) => sum + (pet.estimatedValue || 0), 0);

  if (change !== 0) {
    if (petRow !== -1) {
      sheet.getRange(petRow, 2).setValue(newTotalValue);
      sheet.getRange(petRow, 3).setValue(estimatedTotal);
    } else {
      sheet.appendRow([petName, newTotalValue, estimatedTotal]);
    }

    const payload = {
      embeds: [
        {
          title: `${petName.includes("Gargantuan") ? "**New Gargantuan Hatch!**" : "**New Titanic Hatch!**"}`,
          description: `**Previous**: ${oldValue}\n**New**: ${newTotalValue}\n**Change**: ${change}\n**Estimated Total**: \`${estimatedTotal}\``,
          footer: { text: "sent automatically" },
          thumbnail: { url: imageURL }
        }
      ]
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    };

    UrlFetchApp.fetch(webhookURL, options);
  }
}
