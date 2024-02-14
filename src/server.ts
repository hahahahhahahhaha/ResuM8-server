require("dotenv").config();
import express, { Request, Response } from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import { Client } from "@notionhq/client";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Updated interface to include position, company, summary, and url
interface JobInfo {
  position: string;
  company: string;
  summary: string;
  url: string;
}

const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notionSecret = process.env.NOTION_SECRET;

if (!notionDatabaseId || !notionSecret) {
  throw Error("Must define NOTION_SECRET and NOTION_DATABASE_ID in env");
}

const notion = new Client({ auth: notionSecret });

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req: Request, res: Response) => {
  const query = await notion.databases.query({
    database_id: notionDatabaseId,
  });

  const list: JobInfo[] = query.results.map((row) => {
    const positionCell = row.properties.position;
    const companyCell = row.properties.company;
    const summaryCell = row.properties.summary;
    const urlCell = row.properties.url;

    const position = positionCell.type === "rich_text" ? positionCell.rich_text?.[0].plain_text : "";
    const company = companyCell.type === "rich_text" ? companyCell.rich_text?.[0].plain_text : "";
    const summary = summaryCell.type === "rich_text" ?
    summaryCell.rich_text.map(rt => rt.plain_text).join('') : "";        
    const url = urlCell.type === "url" ? urlCell.url ?? "" : "";

    return { position, company, summary, url };
  });

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify(list));
});

app.post("/generate-resume", (req: Request, res: Response) => {
  const latexContent = req.body.latex;
  const fileName = `resume_${Date.now()}`;
  const filePath = path.join(__dirname, `${fileName}.tex`);
  const outputDir = __dirname;

  // Write the LaTeX content to a .tex file
  fs.writeFileSync(filePath, latexContent);

  // Run pdflatex to generate the PDF
  exec(`pdflatex -output-directory=${outputDir} ${filePath}`, (error: Error | null, stdout: string, stderr: string) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send("Error generating PDF");
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).send("Error generating PDF");
    }

    // Send the PDF file back to the client
    const pdfPath = path.join(outputDir, `${fileName}.pdf`);
    res.sendFile(pdfPath, (err?: Error) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error sending PDF file");
      } else {
        // Cleanup: remove the .tex and .pdf files after sending the PDF
        fs.unlinkSync(filePath);
        fs.unlinkSync(pdfPath);
      }
    });
  });
});

const host = "localhost";
const port = 8000;
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
