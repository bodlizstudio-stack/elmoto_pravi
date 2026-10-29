import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { buildSenderInquiryEmail, buildRecipientInquiryEmail } from "../src/lib/email-templates";

const artifactDir = "C:\\Users\\solna\\.gemini\\antigravity\\brain\\c48162ef-d6c9-4046-be1f-b0d3c554630c";

const sampleData = {
  inquiryId: "inq_9f82d1c7a4b2",
  name: "Luka Novak",
  email: "luka.novak@gmail.com",
  phone: "+386 41 890 123",
  typeLabel: "Nakup motorja",
  motorcycleName: "KOVE 450 Rally Standard (2025)",
  message: "Pozdravljeni,\n\nzanimam se za nakup modela KOVE 450 Rally. Ali imate motor trenutno na zalogi v salonu v Trzinu za ogled? Prav tako me zanima možnost testne vožnje in možnosti financiranja preko lizinga.\n\nHvala in lep pozdrav,\nLuka",
  createdAt: "29. 10. 2026, 09:30",
};

const sender = buildSenderInquiryEmail(sampleData);
const recipient = buildRecipientInquiryEmail(sampleData);

const senderHtmlPath = path.join(artifactDir, "preview-sender.html");
const recipientHtmlPath = path.join(artifactDir, "preview-recipient.html");

fs.writeFileSync(senderHtmlPath, sender.html, "utf-8");
fs.writeFileSync(recipientHtmlPath, recipient.html, "utf-8");

console.log("HTML files written to:", senderHtmlPath, recipientHtmlPath);

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const senderPngPath = path.join(artifactDir, "preview-sender.png");
const recipientPngPath = path.join(artifactDir, "preview-recipient.png");

try {
  // Capture sender screenshot with full height
  execSync(`"${chromePath}" --headless=new --screenshot="${senderPngPath}" --window-size=720,1260 "file:///${senderHtmlPath.replace(/\\/g, "/")}"`, { stdio: "inherit" });
  console.log("Captured sender screenshot:", senderPngPath);

  // Capture recipient screenshot with full height
  execSync(`"${chromePath}" --headless=new --screenshot="${recipientPngPath}" --window-size=720,1260 "file:///${recipientHtmlPath.replace(/\\/g, "/")}"`, { stdio: "inherit" });
  console.log("Captured recipient screenshot:", recipientPngPath);
} catch (err) {
  console.error("Screenshot error:", err);
}
