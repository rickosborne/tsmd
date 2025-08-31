import { expect } from "chai";
import { describe, test } from "mocha";
import { fibonacci } from "./fibonacci.ts.md";

describe(fibonacci.name, () => {
	test("sequence", () => {
		const nums: number[] = [];
		for (const num of fibonacci()) {
			nums.push(num);
			if (nums.length >= 5) {
				break;
			}
		}
		expect(nums).eql([ 1, 1, 2, 3, 5 ]);
	});
});
