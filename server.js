// server.mjs
import express from 'express';
import multer from 'multer';
import csvtojson from 'csvtojson';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
const port = 3000;

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files from the public directory
app.use(express.static(join(__dirname, 'public')));

// Handle file upload
app.post('/upload', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const csvBuffer = req.file.buffer.toString();

  // Convert CSV to JSON
  const jsonArray = await csvtojson({ delimiter: ';' }).fromString(csvBuffer);

  // Create a new worksheet
  const ws = xlsx.utils.aoa_to_sheet(jsonArray.map(row => Object.values(row).map(value => value.trim())));

  // Create a new workbook and add the worksheet
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Convert the workbook to a buffer
  const xlsxBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

  // Set response headers for file download
  res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  // Send XLSX file as response
  res.send(xlsxBuffer);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
export default app;