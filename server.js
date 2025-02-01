const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const PORT = 5000;
const filePath = 'user_details.xlsx';

app.use(cors());
app.use(bodyParser.json());

// Function to initialize Excel file if it does not exist
const initializeExcel = () => {
    if (!fs.existsSync(filePath)) {
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet([]);

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Adding headers
        worksheet['!ref'] = 'A1:C1'; // Define header range
        worksheet['A1'] = { v: 'Name' };
        worksheet['B1'] = { v: 'Phone' };
        worksheet['C1'] = { v: 'About' };

        xlsx.writeFile(workbook, filePath);
    }
};

// Function to write data to Excel file
const writeToExcel = (data) => {
    let workbook;
    let worksheet;

    if (fs.existsSync(filePath)) {
        workbook = xlsx.readFile(filePath);
        worksheet = workbook.Sheets['Sheet1'];
    } else {
        workbook = xlsx.utils.book_new();
        worksheet = xlsx.utils.json_to_sheet([]);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    }

    let existingData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
    existingData.push(data);

    const newWorksheet = xlsx.utils.json_to_sheet(existingData);
    workbook.Sheets['Sheet1'] = newWorksheet;

    xlsx.writeFile(workbook, filePath);
};

// Initialize Excel file
initializeExcel();

// Handle form submissions
app.post('/submit', (req, res) => {
    const { name, phone, about } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and Phone are required' });
    }

    // Append data to Excel file
    writeToExcel({ Name: name, Phone: phone, About: about || '' });

    res.json({ message: 'Details saved to Excel successfully!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
