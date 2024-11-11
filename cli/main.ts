import * as emoji from "npm:node-emoji";
import pc from "npm:picocolors";
import { intro, outro, text, confirm, select } from "npm:@clack/prompts";


export function multiply(a: number, b: number): number {
  return a * b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log(emoji.emojify(`:sauropod: :heart:  npm`));

  console.log(
    pc.green(`How are ${pc.italic(`you`)} doing?`)
  )

  intro(`Multiply`);

  const meaning = await text({
    message: 'What value would you like to multiply?',
    placeholder: 'Not sure',
    initialValue: '42',
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  const multiplier = await select({
    message: 'Multiply with:',
    options: [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 3, label: 'Three', hint: 'triples' },
    ],
  });

  const shouldContinue = await confirm({
    message: 'Do you want to add?',
  });

  if (shouldContinue) {
    outro(`Add ${String(meaning)} X ${multiplier} = ${multiply(parseFloat(meaning as string), parseFloat(multiplier as string))}`);
  } else {
    outro('Ok - nevermind');
  }
}
