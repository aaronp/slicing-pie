import { spinner } from "npm:@clack/prompts"

export const spin = <A>(msg: string) => async (thunk: () => Promise<A>): Promise<A> => {
  const s = spinner()
  s.start(msg)
  
  try {
    const value = await thunk()
    s.stop(msg)
    return value
  } catch(e) {
    s.stop(msg)
    // throw e
    console.error(e)
    Deno.exit(1)
  }
}