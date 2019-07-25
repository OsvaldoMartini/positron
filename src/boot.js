/**
 * Main server that combines API & client
 */

import artsyXapp from "artsy-xapp"
import compression from "compression"
import express from "express"
import path from "path"
import timeout from "connect-timeout"
import { IpFilter } from "express-ipfilter"
import { createReloadable, isDevelopment } from "@artsy/express-reloadable"
import { init as initDataDogTracer } from "tracer"
import { isProduction } from "lib/environment"
import { assetMiddleware } from "./lib/assetMiddleware"

const app = (module.exports = express())
const debug = require("debug")("app")
const server = require("http").createServer(app)
const io = require("socket.io")(server)

const {
  APP_TIMEOUT,
  ARTSY_URL,
  ARTSY_ID,
  ARTSY_SECRET,
  IP_BLACKLIST = "",
  PORT,
} = process.env

// Timeout middleware
if (isProduction) {
  app.use(timeout(APP_TIMEOUT || "29s"))
}

if (process.env.DATADOG_AGENT_HOSTNAME) {
  initDataDogTracer()
}

// Gzip compression
app.use(compression())

// Blacklist ips
app.use(IpFilter([IP_BLACKLIST.split(",")], { log: false, mode: "deny" }))

app.use(assetMiddleware())

// Get an xapp token
const xappConfig = {
  url: ARTSY_URL,
  id: ARTSY_ID,
  secret: ARTSY_SECRET,
}

artsyXapp.init(xappConfig, () => {
  if (isDevelopment) {
    app.use(require("./client/lib/webpack-dev-server"))

    // Enable server-side code hot-swapping on change
    const mountAndReload = createReloadable(app, require)

    app.use(
      "/api",
      mountAndReload(path.resolve("src/api"), {
        mountPoint: "/api",
      })
    )

    invalidateUserMiddleware(app)

    mountAndReload(path.resolve("src/client"), {
      watchModules: ["@artsy/reaction"],
    })

    // Staging, Prod
  } else {
    app.use("/api", require("./api"))
    invalidateUserMiddleware(app)
    app.use(require("./client"))
  }

  require("./client/apps/websocket").init(io)
  require("./client/lib/setup/session").initSocketSession(app, io)

  // Start the server and send a message to IPC for the integration test
  // helper to hook into.
  server.listen(PORT, () => {
    console.log(`\n[Positron] Booting app...\n`)

    if (typeof process.send === "function") {
      process.send("listening")
    }
  })
})

// Crash if we can't get/refresh an xapp token
artsyXapp.on("error", error => {
  console.warn(error)
  console.log(
    "\nCould not set up the xapp token, likely an issue with ARTSY_ID and ARTSY_SECRET"
  )
  process.exit(1)
})

const invalidateUserMiddleware = app => {
  app.use((req, rest, next) => {
    req.user = null
    next()
  })
}
