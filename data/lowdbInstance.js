import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("./data/data.json");
export const db = new Low(adapter, { preferences: [] });

await db.read();
