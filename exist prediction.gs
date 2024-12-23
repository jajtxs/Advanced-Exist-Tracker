function predictExistCount() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("x");
  if (!sheet) {
    Logger.log("x does not exist.");
    return;
  }

  const currentTime = new Date();
  const eventStart = getLastSaturdayUpdate();
  const eventEnd = getNextSaturdayUpdate();
  
  const elapsedHours = (currentTime - eventStart) / (1000 * 60 * 60);
  const timeRemaining = (eventEnd - currentTime) / (1000 * 60 * 60);
  
  if (timeRemaining <= 0) {
    Logger.log("Remaining time <0");
    return;
  }
  
  if (elapsedHours <= 0) {
    Logger.log("Elapsed time <0");
    return;
  }

  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(1, 2, lastRow, 1).getValues();

  sheet.getRange(1, 3, lastRow, 1).clearContent();

  const predictions = [];
  
  data.forEach(row => {
    const currentCount = row[0];
    if (currentCount === "" || isNaN(currentCount)) {
      predictions.push([""]);
      return;
    }
    
    const hatchRate = currentCount / elapsedHours;
    const estimatedCount = Math.floor(currentCount + hatchRate * timeRemaining);
    predictions.push([estimatedCount]);
  });
  
  sheet.getRange(1, 3, predictions.length, 1).setValues(predictions);
}

function getLastSaturdayUpdate() {
  const now = new Date();
  const day = now.getUTCDay();
  const daysSinceSaturday = (day + 1) % 7;
  const lastSaturday = new Date(now.getTime() - daysSinceSaturday * 24 * 60 * 60 * 1000);
  
  lastSaturday.setUTCHours(17);
  lastSaturday.setUTCMinutes(0);
  lastSaturday.setUTCSeconds(0);
  lastSaturday.setUTCMilliseconds(0);
  
  return lastSaturday;
}

function getNextSaturdayUpdate() {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const nextSaturday = new Date(now.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
  
  nextSaturday.setUTCHours(17);
  nextSaturday.setUTCMinutes(0);
  nextSaturday.setUTCSeconds(0);
  nextSaturday.setUTCMilliseconds(0);
  
  return nextSaturday;
}
