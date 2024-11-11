import { assertEquals } from "@std/assert";
import { multiply } from "./main.ts";

Deno.test(function multiplyTest() {
  assertEquals(multiply(2, 3), 15);
});
