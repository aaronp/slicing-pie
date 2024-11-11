import * as emoji from "npm:node-emoji";
import pc from "npm:picocolors";


export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log(emoji.emojify(`:sauropod: :heart:  npm`));

  console.log(
    pc.green(`How are ${pc.italic(`you`)} doing?`)
  )

  console.log("Add 2 + 3 =", add(2, 3));
}
