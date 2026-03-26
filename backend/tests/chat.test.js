const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server_test'); // I'll create a variant of server.js for testing

describe('Tactical Comms: Private Messaging Drills', () => {
    let otherUserId = new mongoose.Types.ObjectId();

    it('should confirm the Signal Bridge is operational (Ping)', async () => {
        const res = await request(app).get('/ping');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('backend alive');
    });

    it('should prevent unauthorized signal broadcasts', async () => {
        const res = await request(app)
            .post('/api/chat/private')
            .send({ recipientId: otherUserId, text: 'Test Signal' });
        expect(res.status).toBe(401);
    });
});
