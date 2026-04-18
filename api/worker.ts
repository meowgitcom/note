import { createApp } from "./app"
import { createD1Db } from "./db/d1"

type Env = {
  DB: D1Database
}

export default {
  fetch(request: Request, env: Env) {
    const db = createD1Db(env.DB)
    const app = createApp({ db })
    return app.handle(request)
  },
}
