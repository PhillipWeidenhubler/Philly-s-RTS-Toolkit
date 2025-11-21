const puppeteer = require("puppeteer");
const { spawn } = require("child_process");

async function waitForServer(proc) {
    return new Promise((resolve, reject) => {
        let resolved = false;
        proc.stdout.on("data", (data) => {
            const text = data.toString();
            process.stdout.write(text);
            if (!resolved && text.includes("Local:")) {
                resolved = true;
                resolve(undefined);
            }
        });
        proc.stderr.on("data", (data) => process.stderr.write(data.toString()));
        proc.on("error", reject);
        proc.on("exit", (code) => {
            if (!resolved) {
                reject(new Error(`Dev server exited early with code ${code}`));
            }
        });
    });
}

(async () => {
    const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "4173"], {
        cwd: __dirname,
        shell: true,
    });
    try {
        await waitForServer(server);
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        page.on("console", (msg) => {
            console.log("[browser]", msg.type(), msg.text());
        });
        page.on("pageerror", (error) => {
            console.error("[pageerror]", error);
        });
        await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle2" });
        await page.waitForTimeout(2000);
        await browser.close();
    } catch (error) {
        console.error("[debug]", error);
    } finally {
        server.kill();
    }
})();
