import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from("universities")
  .select("id, is_active");

if (error) {
  console.error("SUPABASE TEST FAILED:", {
    code: error.code,
    status: error.status,
  });
  process.exitCode = 1;
} else {
  console.log("SUPABASE CONNECTION SUCCESSFUL");
  console.log("University records found:", data.length);
  console.log("Active records:", data.filter((row) => row.is_active).length);
}
