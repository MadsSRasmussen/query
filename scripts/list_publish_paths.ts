type PublishConfig = {
    publishOrder: string[];
};

/* Read publish config */
const configPath = "scripts/publish.config.json";
const config = JSON.parse(await Deno.readTextFile(configPath)) as PublishConfig;

if (!Array.isArray(config.publishOrder) || config.publishOrder.length === 0) {
    throw new Error(`No publishOrder list found in ${configPath}`);
}

/* Chack name and version specifiers in packages */
for (const pkg of config.publishOrder) {
    const packageConfigPath = `${pkg}/deno.json`;
    const packageConfig = JSON.parse(
        await Deno.readTextFile(packageConfigPath),
    ) as {
        name?: string;
        version?: string;
    };

    if (!packageConfig.name || !packageConfig.version) {
        throw new Error(`Missing name/version in ${packageConfigPath}`);
    }
}

/* Write paths to standard out */
if (Deno.args.includes("--json")) {
    console.log(JSON.stringify(config.publishOrder));
} else {
    for (const pkg of config.publishOrder) {
        console.log(pkg);
    }
}
