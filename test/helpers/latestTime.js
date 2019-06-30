// Returns the time of the last mined block in seconds
async function latestTime () {
  let result = await web3.eth.getBlock('latest');
  return result.timestamp;
}

module.exports = {
  latestTime
}
