//const test = require("tape");
const { Test } = require("tape");
const nodeFetch = require("node-fetch")
const { LocalTableland } = require("@tableland/local/bin/cjs/main.js");

// @ts-ignore
globalThis.fetch = nodeFetch

let initializing: Promise<void> | undefined
let ready = false
let localNetwork: typeof LocalTableland | undefined
module.exports = function (t: typeof Test) {
  // if the local network is running the caller can proceed, but we
  // wait so that tests for hit the request rate limit on the validator
  if (ready) return new Promise((resolve) => setTimeout(() => resolve(0), 2500))

  // increase the timeout since this might take a while
  t.timeoutAfter(200 * 1000)
  // if the promise exists return it so the caller can await it
  if (initializing) return initializing

  // start the local network
  initializing = new Promise(function (resolve) {
    // start the local node for all tests
    localNetwork = new LocalTableland(/* config in tableland.config.js */)

    localNetwork.start()

    localNetwork.initEmitter.on("validator ready", () => {
      ready = true
      resolve()
    })
  })

  return initializing
}

// TODO: handle starting the local node in setup for all tests
Test.onFinish(async function () {
  console.log("onFinish")
  if (!localNetwork) return
  console.log("shutting down")
  await localNetwork.shutdown()
  console.log("shutdown")
})
