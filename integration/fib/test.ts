import { fibonacci } from "./fibonacci.ts.md";

const expectedNums = [1, 1, 2, 3, 5, 8, 13, 21];

let i = 0;
for (const num of fibonacci()) {
	const expected = expectedNums[i];
	if (expected == null) {
		break;
	}
	if (num !== expected) {
		throw new Error(`Expected ${expected}, actual ${num}`);
	}
	i++;
}

console.log("🎉");
