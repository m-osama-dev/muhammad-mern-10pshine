process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";

const { expect } = require("chai");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const { connectTestDB, closeTestDB, clearTestDB } = require("./setup");
const errorHandler = require("../src/middleware/errorHandler");

describe("Auth Controller", () => {
  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe("POST /api/auth/signup", () => {
    it("registers a new user and returns a token", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Muhammad Osama",
        email: "osama@example.com",
        password: "password123",
      });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.token).to.be.a("string");
      expect(res.body.data.email).to.equal("osama@example.com");
    });

    it("rejects signup with missing fields", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        email: "incomplete@example.com",
      });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
    });

    it("rejects duplicate email signup", async () => {
      await User.create({
        name: "Existing User",
        email: "dupe@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/signup").send({
        name: "Another User",
        email: "dupe@example.com",
        password: "password123",
      });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.match(/already exists/i);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with correct credentials", async () => {
      await request(app).post("/api/auth/signup").send({
        name: "Login Test",
        email: "login@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.status).to.equal(200);
      expect(res.body.token).to.be.a("string");
    });

    it("rejects login with wrong password", async () => {
      await request(app).post("/api/auth/signup").send({
        name: "Login Test",
        email: "login2@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "login2@example.com",
        password: "wrongpassword",
      });

      expect(res.status).to.equal(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns the logged-in user's profile", async () => {
      const signupRes = await request(app).post("/api/auth/signup").send({
        name: "Me Test",
        email: "me@example.com",
        password: "password123",
      });

      const token = signupRes.body.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.data.email).to.equal("me@example.com");
    });

    it("rejects requests without a token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).to.equal(401);
    });
  });

  describe("PUT /api/auth/me", () => {
    it("updates the user's name", async () => {
      const signupRes = await request(app).post("/api/auth/signup").send({
        name: "Update Test",
        email: "update@example.com",
        password: "password123",
      });

      const token = signupRes.body.token;

      const res = await request(app)
        .put("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Name" });

      expect(res.status).to.equal(200);
      expect(res.body.data.name).to.equal("Updated Name");
    });

    it("rejects updating to an email already in use", async () => {
      await request(app).post("/api/auth/signup").send({
        name: "First User",
        email: "taken@example.com",
        password: "password123",
      });

      const signupRes = await request(app).post("/api/auth/signup").send({
        name: "Second User",
        email: "second@example.com",
        password: "password123",
      });

      const token = signupRes.body.token;

      const res = await request(app)
        .put("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "taken@example.com" });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.match(/already in use/i);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("logs the user out successfully", async () => {
      const signupRes = await request(app).post("/api/auth/signup").send({
        name: "Logout Test",
        email: "logout@example.com",
        password: "password123",
      });

      const token = signupRes.body.token;

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
    });
  });
});

describe("Error Handler Middleware", () => {
  function createRes() {
    return {
      statusCode: null,
      body: null,

      status(code) {
        this.statusCode = code;
        return this;
      },

      json(data) {
        this.body = data;
        return this;
      },
    };
  }

  const req = {
    originalUrl: "/test-route",
    method: "GET",
  };

  const next = () => {};

  it("handles a normal operational error", () => {
    const err = {
      statusCode: 400,
      message: "Invalid request",
      isOperational: true,
    };

    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.statusCode).to.equal(400);
    expect(res.body.success).to.equal(false);
    expect(res.body.message).to.equal("Invalid request");
  });

  it("handles a Mongoose CastError", () => {
    const err = {
      name: "CastError",
      message: "Invalid ID",
    };

    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.statusCode).to.equal(404);
    expect(res.body.message).to.equal("Resource not found");
  });

  it("handles duplicate key errors", () => {
    const err = {
      code: 11000,
      message: "Duplicate key",
    };

    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.equal("Duplicate field value entered");
  });

  it("handles Mongoose validation errors", () => {
    const err = {
      name: "ValidationError",
      message: "Validation failed",
      errors: {
        email: { message: "Email is required" },
        password: { message: "Password is required" },
      },
    };

    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.equal(
      "Email is required, Password is required",
    );
  });

  it("hides stack trace outside development mode", () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";

    const err = {
      message: "Unexpected error",
      stack: "some-stack",
    };

    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.statusCode).to.equal(500);
    expect(res.body.stack).to.be.undefined;

    process.env.NODE_ENV = previousEnv;
  });

  it("includes stack trace in development mode", () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const err = {
      message: "Development error",
      stack: "test-stack-trace",
    };

    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.statusCode).to.equal(500);
    expect(res.body.stack).to.equal("test-stack-trace");

    process.env.NODE_ENV = previousEnv;
  });
});

describe("CORS Origin Validation", () => {
  it("allows requests in the test environment", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";

    let result;

    app.corsOrigin("http://anything.com", (err, allowed) => {
      result = { err, allowed };
    });

    expect(result.err).to.be.null;
    expect(result.allowed).to.equal(true);

    process.env.NODE_ENV = originalEnv;
  });

  it("allows requests with no origin", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    let result;

    app.corsOrigin(undefined, (err, allowed) => {
      result = { err, allowed };
    });

    expect(result.err).to.be.null;
    expect(result.allowed).to.equal(true);

    process.env.NODE_ENV = originalEnv;
  });

  it("rejects an unauthorized origin", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    let result;

    app.corsOrigin("http://malicious-site.com", (err, allowed) => {
      result = { err, allowed };
    });

    expect(result.err).to.be.an("Error");
    expect(result.err.message).to.equal("Not allowed by CORS");

    process.env.NODE_ENV = originalEnv;
  });
});
