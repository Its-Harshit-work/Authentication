const xlsx = require("xlsx");
const fs = require("fs");

const appendToExcel = async (filePath, newData) => {
  const sheetName = "Responses";
  let workbook;
  let jsonData = [];

  // Load the existing workbook or create a new one
  if (fs.existsSync(filePath)) {
    workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];
    if (worksheet) {
      jsonData = xlsx.utils.sheet_to_json(worksheet); // Load existing data
    }
  } else {
    workbook = xlsx.utils.book_new(); // Create a new workbook
  }

  // Update existing records or add new ones
  newData.forEach(newRecord => {
    const existingIndex = jsonData.findIndex(
      record =>
        record.FirstName === newRecord.FirstName &&
        record.LastName === newRecord.LastName
    );

    if (existingIndex !== -1) {
      // Update the existing record
      jsonData[existingIndex] = { ...jsonData[existingIndex], ...newRecord };
    } else {
      // Add the new record
      jsonData.push(newRecord);
    }
  });

  // Convert JSON data back to worksheet
  const worksheet = xlsx.utils.json_to_sheet(jsonData);

  // Remove existing sheet if it exists
  if (workbook.Sheets[sheetName]) {
    delete workbook.Sheets[sheetName];
    workbook.SheetNames = workbook.SheetNames.filter(name => name !== sheetName);
  }

  // Append the updated worksheet to the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Save the workbook
  xlsx.writeFile(workbook, filePath);
};

module.exports = { appendToExcel };