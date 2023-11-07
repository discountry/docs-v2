import { outputFile } from "fs-extra";
import { extractSearchData } from "../src/app/api/search/extraction";

async function main() {
	const websiteData = await extractSearchData();
	await outputFile(
		".data/search-content.json",
		JSON.stringify(websiteData, null, 2),
	);
}

main();
