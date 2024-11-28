import { spin } from "./util.ts"
import { GruntFund } from "./GruntFund.ts"

export const listEvents = async (gruntFund : GruntFund) => {
    await spin(`Events:`)(async () => {
        const result = await gruntFund.events()
        console.log(JSON.stringify(result, null, 2))
      })
}