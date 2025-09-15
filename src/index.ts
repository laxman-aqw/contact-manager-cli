import { main } from './cli/index.js'
import { connectDB } from './db/index.js'

async function bootstrap() {
  await connectDB()
  await main()
}

bootstrap().catch((err) => console.error(err))
