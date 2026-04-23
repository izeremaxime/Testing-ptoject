import request from 'supertest';
import app from '../../app.js';
import { describe, it } from 'mocha';
import { expect } from 'chai';


describe('API Test with ES Modules', () => {
    it('GET / should return succes message', async () => {
        const response = await request(app).get('/');
        expect(response.status).to.equal(200);
        expect(response.body.message).to.equal('Testing environment ready!');
        expect(response.body.moduleType).to.equal('ES modules');
    });

    it('GET /health should return healthy status', async () => {
        const response = await request(app).get('/health');
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('healthy');
        expect(response.body.timestamp).to.not.be.undefined;
    });
});