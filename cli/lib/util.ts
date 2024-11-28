import { spinner, text } from "npm:@clack/prompts"

export const readHash = async () => await text({
  message: 'What is the document hash for the reference?',
  placeholder: 'hash...',
  initialValue: '',
  validate(value) {
    // if (value.length === 0) return `The address is required!`
    if (value.length === 0) return `Please enter the hash from a document`
  },
})

export const readAmount = async () => await text({
  message: 'How many?',
  placeholder: '1',
  initialValue: '',
  validate(value) {
    let ok = true
    try {
      const x = parseInt(value)
      ok = x > 0
    } catch (e) {
      ok = false
    }
    if (!ok) return `Invalid amount ${value}`
  },
})
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