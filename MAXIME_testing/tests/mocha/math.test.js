import { add, multiply, divide } from '../../math.js';
import mathmodule from '../../math.js';
import { describe, it} from 'mocha';
import { expect } from 'chai';

describe(' Math Module Tests', () => {
    it ('add function works correctly', () => {
        expect(add(2, 3)).to.equal(5);
        expect(add(-1, 1)).to.equal(0);
    });

    it('multiply function works correctly', () => {
        expect(multiply(3, 4)).to.equal(12);
        expect(multiply(-2, 3)).to.equal(-6);
    });

    it('divide function works correctly', () => {
        expect(divide(10, 2)).to.equal(5);
        expect(() => divide(10, 0)).to.throw('division by zero');
    });

    it('default export works', () => {
        expect(mathmodule.add(5, 5)).to.equal(10);
    });
});
