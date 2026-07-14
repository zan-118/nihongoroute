import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) return;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  });
}

loadEnvFile();

const aiBaseUrl = process.env.AI_BASE_URL || process.env.NINEROUTER_URL;
const aiApiKey = process.env.AI_API_KEY || process.env.NINEROUTER_KEY || "";
const aiModel = "ag/gemini-3-flash";

if (!aiBaseUrl) {
  console.error("❌ AI_BASE_URL / NINEROUTER_URL tidak ditemukan di .env.local!");
  process.exit(1);
}

console.log(`🤖 9Router diaktifkan.`);
console.log(`🔗 Endpoint: ${aiBaseUrl}`);
console.log(`📦 Model: ${aiModel}`);

async function callNineRouterWithTimeout(prompt, systemInstruction, timeoutMs = 45000) {
  const url = aiBaseUrl.endsWith("/v1") ? `${aiBaseUrl}/chat/completions` : `${aiBaseUrl}/v1/chat/completions`;
  
  const body = {
    model: aiModel,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    stream: false
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(aiApiKey ? { Authorization: `Bearer ${aiApiKey}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`9Router API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (stat.isFile() && (file.endsWith(".ts") || file.endsWith(".tsx"))) {
      // Kecualikan berkas auto-generated
      if (!file.endsWith(".generated.ts") && !file.endsWith("next-env.d.ts")) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const systemInstruction = `
You are a senior TypeScript engineer. Your only job is to receive a code file and enhance it by:
1. Adding detailed, professional, and concise JSDoc comments to all exported and internal classes, interfaces, types, functions, custom hooks, Zustand stores, server actions, and React components.
2. Adding brief, helpful inline comments to explain complex, non-obvious, or tricky lines of code.
3. Keeping JSDoc explanations in clear, technical English.

CRITICAL LAWS:
- DO NOT CHANGE, EDIT, OR DELETE a single character of the executable code, variables, imports, exports, logic, JSX elements, or conditions.
- DO NOT rewrite or refactor the code. Only add comments and JSDoc blocks.
- Keep JSDocs and comments concise to avoid long response times.
- Keep the indentation and formatting of the code clean.
- Return the ENTIRE modified file wrapped in a markdown code block, like this:
\`\`\`typescript
[Entire modified code here]
\`\`\`
`.trim();

async function processFileWithRetry(filePath, maxRetries = 2) {
  const originalCode = fs.readFileSync(filePath, "utf8");
  const prompt = `Here is the TypeScript file at path: ${filePath}. Please add JSDocs and inline comments. Return the entire code inside a markdown code block.\n\n\`\`\`typescript\n${originalCode}\n\`\`\``;

  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`⏳ Memproses berkas: ${relativePath}...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const responseText = await callNineRouterWithTimeout(prompt, systemInstruction, 45000);
      const match = responseText.match(/```(?:typescript|tsx|javascript|js)?\n([\s\S]*?)```/);
      
      if (!match) {
        throw new Error("Respons AI tidak mengandung format markdown code block!");
      }
      
      const modifiedCode = match[1].trim();
      
      if (modifiedCode.length < originalCode.length * 0.7) {
        throw new Error("AI memotong atau memperpendek isi berkas secara tidak wajar!");
      }

      // Tulis kembali ke berkas
      fs.writeFileSync(filePath, modifiedCode, "utf8");
      console.log(`   ✅ Berhasil mendokumentasikan!`);
      return true; // Sukses
    } catch (error) {
      console.warn(`   ⚠️ Percobaan #${attempt} gagal untuk ${relativePath}: ${error.message}`);
      if (attempt < maxRetries) {
        await sleep(2000); // Tunggu sebelum mencoba ulang
      } else {
        throw error; // Re-throw jika batas retry habis
      }
    }
  }
  return false;
}

async function main() {
  console.log("====================================================");
  console.log("⚙️  NIHONGOROUTE AUTOMATED JSDOC GENERATOR (9ROUTER)");
  console.log("====================================================\n");

  const srcDir = path.join(process.cwd(), "src");
  if (!fs.existsSync(srcDir)) {
    console.error("❌ Folder src/ tidak ditemukan!");
    process.exit(1);
  }

  const files = getFilesRecursively(srcDir);
  console.log(`📂 Terdeteksi total ${files.length} berkas sumber untuk diproses.`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = `[${i + 1}/${files.length}]`;
    try {
      await processFileWithRetry(file, 2);
      successCount++;
      await sleep(500); // Jeda singkat
    } catch (error) {
      console.error(`   ❌ Gagal memproses berkas ${progress} ${file}:`, error.message);
      failCount++;
    }
  }

  console.log("\n====================================================");
  console.log(`🎉 Proses selesai! Sukses: ${successCount}, Gagal: ${failCount}`);
  console.log("====================================================");
}

main();
