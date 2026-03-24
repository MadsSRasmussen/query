type PublishConfig = {
    publishOrder: string[];
};

/* Read publish config */
const configPath = "scripts/publish.config.json";
const config = JSON.parse(await Deno.readTextFile(configPath)) as PublishConfig;

if (!Array.isArray(config.publishOrder) || config.publishOrder.length === 0) {
    throw new Error(`No publishOrder list found in ${configPath}`);
}

/* Extract version tag from release */
const tag = Deno.env.get("GITHUB_REF_NAME");
const version = tag?.replace(/^v/, "");

if (!version) throw new Error("No version tag found");

const [major, minor, patch] = version.split(".").map(Number);

if (![major, minor, patch].every((part) => Number.isInteger(part))) {
    throw new Error("Version tag parsing failed");
}

const newVersion = `${major}.${minor}.${patch}`;

/* Update version field in deno.json */
for (const pkg of config.publishOrder) {
    const path = `${pkg}/deno.json`;
    const json = JSON.parse(await Deno.readTextFile(path));

    if (!json.version) {
        throw new Error(`No version key found in deno.json for ${pkg}`);
    }

    json.version = newVersion;

    await Deno.writeTextFile(path, `${JSON.stringify(json, null, 4)}\n`);
}

/* Log result to console */
console.log(`[bump_version.ts]: Bumped version to ${newVersion}`);
