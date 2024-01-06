import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { users, reports } from "./schema";
import { eq } from "drizzle-orm";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.text("Hello Hono!"));

// get users
app.get("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(users).all();
  return c.json(result);
});

// create user
app.post("/users", async (c) => {
  const params = await c.req.json<typeof users.$inferSelect>();
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(users)
    .values({ authId: params.authId, username: params.username })
    .execute();
  return c.json(result);
});

// update user
app.put("/users/:auth_id", async (c) => {
  const authId = c.req.param("auth_id");

  const params = await c.req.json<typeof users.$inferSelect>();
  const db = drizzle(c.env.DB);
  const result = await db
    .update(users)
    .set({ username: params.username })
    .where(eq(users.authId, authId));
  return c.json(result);
});

// get reports
app.get("/users/:user_id/reports", async (c) => {
  const userId = parseInt(c.req.param("user_id"));
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.userId, userId))
    .all();
  return c.json(result);
});

// post report
app.post("/users/:user_id/reports", async (c) => {
  const userId = parseInt(c.req.param("user_id"));
  const params = await c.req.json<typeof reports.$inferSelect>();
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(reports)
    .values({ content: params.content, userId: userId })
    .execute();
  return c.json(result);
});

// update report
app.put("/reports/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "invalid ID" }, 400);
  }

  const params = await c.req.json<typeof reports.$inferSelect>();
  const db = drizzle(c.env.DB);
  const result = await db
    .update(reports)
    .set({ content: params.content })
    .where(eq(reports.id, id));
  return c.json(result);
});

// delete report
app.delete("/reports/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "invalid ID" }, 400);
  }

  const db = drizzle(c.env.DB);
  const result = await db.delete(reports).where(eq(reports.id, id));
  return c.json(result);
});

export default app;
