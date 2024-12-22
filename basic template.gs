function trackPets() {
  const SHEET_NAME
  const WEBHOOK_URL 
  const BASE_IMAGE_URL 
  const IMAGE_CODE 
  const API_URL 
  const PET_NAME 

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

  const response = UrlFetchApp.fetch(API_URL);
  const data = JSON.parse(response.getContentText()).data;

  trackSpecificPets(sheet, data, PET_NAME, BASE_IMAGE_URL + IMAGE_CODE, WEBHOOK_URL);
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

  if (change !== 0) {
    if (petRow !== -1) {
      sheet.getRange(petRow, 2).setValue(newTotalValue);
    } else {
      sheet.appendRow([petName, newTotalValue]);
    }

    const payload = {
      embeds: [
        {
          title: `${petName} Tracker`,
          description: `**Previous**: ${oldValue}\n**New**: ${newTotalValue}\n**Change**: ${change}`,
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
