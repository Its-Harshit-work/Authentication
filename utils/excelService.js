const xlsx = require("xlsx");
const fs = require("fs");

const appendToExcel = async (filePath, data) => {
  let workbook;
  let sheetName = "Responses";

  if (fs.existsSync(filePath)) {
    workbook = xlsx.readFile(filePath);
  } else {
    workbook = xlsx.utils.book_new();
  }

  let worksheet = workbook.Sheets[sheetName];
  let jsonData = worksheet ? xlsx.utils.sheet_to_json(worksheet) : [];

  jsonData = [...jsonData, ...data];
  worksheet = xlsx.utils.json_to_sheet(jsonData);

  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  xlsx.writeFile(workbook, filePath);
};

module.exports = { appendToExcel };