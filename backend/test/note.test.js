process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

async function registerAndLogin(email) {
  const res = await request(app).post('/api/auth/signup').send({
    name: 'Test User',
    email,
    password: 'password123',
  });

  if (res.status !== 201 || !res.body.token) {
    throw new Error(`Signup failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return res.body.token;
}

describe('Notes Controller', () => {
  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).to.equal(401);
  });

  it('creates and fetches a note for the authenticated user', async () => {
    const token = await registerAndLogin('noteuser@example.com');

    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My First Note', content: 'Hello world' });

    expect(createRes.status).to.equal(201);
    expect(createRes.body.data.title).to.equal('My First Note');

    const listRes = await request(app).get('/api/notes').set('Authorization', `Bearer ${token}`);
    expect(listRes.status).to.equal(200);
    expect(listRes.body.count).to.equal(1);
  });

  it("does not let one user access another user's note", async () => {
    const tokenA = await registerAndLogin('usera@example.com');
    const tokenB = await registerAndLogin('userb@example.com');

    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Private Note', content: 'secret' });

    const noteId = createRes.body.data._id;

    const getRes = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(getRes.status).to.equal(404);
  });

  it('updates a note', async () => {
    const token = await registerAndLogin('updateuser@example.com');

    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Original Title', content: 'Original content' });

    const noteId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    expect(updateRes.status).to.equal(200);
    expect(updateRes.body.data.title).to.equal('Updated Title');
  });

  it('deletes a note', async () => {
    const token = await registerAndLogin('deleteuser@example.com');

    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete', content: 'bye' });

    const noteId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).to.equal(200);

    const getRes = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).to.equal(404);
  });
});
