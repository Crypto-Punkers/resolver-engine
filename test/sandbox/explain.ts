import { BrowserImportResolver, Explanation } from "../../src";

let browserResolver = BrowserImportResolver();

function printExtra(explanation: Explanation<any>) {
	function itOrUndefined(it?: Object): string {
		return it ? it.toString() : "(undefined)";
	}
	console.log(`Resolver: ${itOrUndefined(explanation.resolver)} .`);
	console.log(`Parser: ${itOrUndefined(explanation.parser)} .`);
}

(async () => {
	let positive_result = await browserResolver.explain("explain.js", __dirname);
	printExtra(positive_result);

	let another_positive = await browserResolver.explain("github:Crypto-Punkers/resolver-engine/examples/github.ts");
	printExtra(another_positive);

	let negative_result = await browserResolver.explain("does_not_exist.js", __dirname);
	printExtra(negative_result);

	let another_negative = await browserResolver.explain("github:Crypto-Punkers/resolver-engine/examples/does_not_exist.ts");
	printExtra(another_negative);

})();