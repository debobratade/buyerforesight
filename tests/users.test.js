process.env.DB_PATH = ":memory:";

const request = require("supertest");
let app;

beforeAll(async () => {
    app = await require("../src/app");
});

const BASE = "/api/v1/users";
const newUser = (overrides = {}) => ({
    name: "John Doe",
    email: `john_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`,
    age: 25,
    role: "user",
    ...overrides,
});

describe("POST /users — createUser", () => {
    it("creates a user and returns 201", async () => {
        const res = await request(app).post(BASE).send(newUser());
        expect(res.status).toBe(201);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data.name).toBe("John Doe");
    });

    it("returns 409 on duplicate email", async () => {
        const user = newUser({ email: "duplicate@test.com" });
        await request(app).post(BASE).send(user);
        const res = await request(app).post(BASE).send({ ...user, name: "Other" });
        expect(res.status).toBe(409);
        expect(res.body.status).toBe(false);
    });

    it("returns 400 for invalid email", async () => {
        const res = await request(app).post(BASE).send(newUser({ email: "bad-email" }));
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
    });

    it("returns 400 when name is missing", async () => {
        const res = await request(app).post(BASE).send({ email: "a@b.com" });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
    });

    it("returns 400 for invalid role", async () => {
        const res = await request(app).post(BASE).send(newUser({ role: "superadmin" }));
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
    });
});

describe("GET /users — getUsers", () => {
    it("returns list with total count", async () => {
        await request(app).post(BASE).send(newUser());
        const res = await request(app).get(BASE);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data).toHaveProperty("total");
        expect(res.body.data).toHaveProperty("users");
    });

    it("filters by search term", async () => {
        await request(app).post(BASE).send(newUser({ name: "Unique Person", email: "unique@test.com" }));
        const res = await request(app).get(`${BASE}?search=Unique+Person`);
        expect(res.body.data.users.some(u => u.name === "Unique Person")).toBe(true);
    });

    it("sorts by name ascending", async () => {
        const res = await request(app).get(`${BASE}?sort=name&order=asc`);
        const names = res.body.data.users.map(u => u.name);
        expect(names).toEqual([...names].sort());
    });

    it("returns 400 for invalid order value", async () => {
        const res = await request(app).get(`${BASE}?order=random`);
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
    });
});

describe("GET /users/:id — getUserById", () => {
    it("returns the user by ID", async () => {
        const { body } = await request(app).post(BASE).send(newUser());
        const res = await request(app).get(`${BASE}/${body.data.id}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data.id).toBe(body.data.id);
    });

    it("returns 404 for unknown ID", async () => {
        const res = await request(app).get(`${BASE}/99999`);
        expect(res.status).toBe(404);
        expect(res.body.status).toBe(false);
    });
});

describe("PUT /users/:id — updateUser", () => {
    it("updates the user", async () => {
        const { body } = await request(app).post(BASE).send(newUser());
        const res = await request(app).put(`${BASE}/${body.data.id}`).send({ name: "Updated Name" });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data.name).toBe("Updated Name");
    });

    it("returns 404 for unknown ID", async () => {
        const res = await request(app).put(`${BASE}/99999`).send({ name: "Ghost" });
        expect(res.status).toBe(404);
        expect(res.body.status).toBe(false);
    });

    it("returns 400 when body is empty", async () => {
        const { body } = await request(app).post(BASE).send(newUser());
        const res = await request(app).put(`${BASE}/${body.data.id}`).send({});
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
    });
});

describe("DELETE /users/:id — deleteUser", () => {
    it("deletes the user", async () => {
        const { body } = await request(app).post(BASE).send(newUser());
        const del = await request(app).delete(`${BASE}/${body.data.id}`);
        expect(del.status).toBe(200);
        expect(del.body.status).toBe(true);
        const get = await request(app).get(`${BASE}/${body.data.id}`);
        expect(get.status).toBe(404);
    });

    it("returns 404 for unknown ID", async () => {
        const res = await request(app).delete(`${BASE}/99999`);
        expect(res.status).toBe(404);
        expect(res.body.status).toBe(false);
    });
});
