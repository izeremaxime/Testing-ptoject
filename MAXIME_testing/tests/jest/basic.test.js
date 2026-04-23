//import { expect } from "chai";

describe('Environment Setup Verification',() => {
    test('Node.js is working', () => {
        expect (typeof process.version).toBe('string');
    });

    test('Basic math operations', () => {
        expect(2 + 2).toBe(4);
    });

    test('ES modules are working', () => {
        const testFunction = () => 'ES modules work!';
        expect(testFunction()).toBe('ES modules work!');
    });
});