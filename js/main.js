'use strict'

window.onload = main

const UPDATE_INTERVAL = 5000
const DATA_SRC = 'wss://ws.blockchain.info/inv'
const LIMIT = 25

let txs = []

class UnconfirmedTransactions {
  constructor (socketConnection = { url: '' }, limit = 25) {
    this.socketConnection = socketConnection
    this.limit = limit
    this.connection = null
    if (this.socketConnection.url !== '') {
      this.attemptSocketConnection()
    }
  }

  attemptSocketConnection () {
    try {
      const conn = new WebSocket(this.socketConnection.url)
      this.connection = conn
    } catch (err) {
      throw err
    }
  }

  bindEventOnSocketOpen (eventCb) {
    try {
      this.connection.addEventListener('open', eventCb)
    } catch (err) {
      throw err
    }
  }

  bindEventOnSocketMessage (eventCb) {
    try {
      this.connection.onmessage = eventCb
    } catch (err) {
      throw err
    }
  }

  getSocketState () {
    if (this.connection) switch (this.connection.readyState) {
      case (0):
        return 'CONNECTING'
      case (1):
        return 'OPEN'
      case (2):
        return 'CLOSING'
      case (3):
        return 'CLOSED'
      default:
        break
    }
  }

  sendMessage (messageObj) {
    this.connection.send(JSON.stringify(messageObj))
  }

  closeConnection () {
    this.connection.close('Closing connection...')
  }
}

function getPrice () {
  return fetch('https://blockchain.info/ticker', { method: 'GET' })
    .then(res => res.json())
    .then(data => data.USD.last)
}

function loop (state, socketObj) {
  if (state.socketState === 'CONNECTING' || state.socketState === 'OPEN') {
    // loop...
    window.console.log('Socket connection is:', socketObj.getSocketState())
    
    txs.forEach(async tx => {
      const priceOfBitcoin = await getPrice()
      $('#price').text(priceOfBitcoin)
      const mainList = $('#main')
      const spanTime = $('<span />').text(tx.time)
      const spanHash = $('<span />').text(tx.hash)
      const ulOut = $('<ul />')
      let totalVal = 0
      tx.output.forEach(output => {
        const liOut = $('<li />')
          .text(
            `Address: ${output.addr},`,
            `Bitcoin: ${output.value / Math.pow(10, 8)},`,
            `Value: $${output.value / Math.pow(10, 8) * priceOfBitcoin}`
          )
        ulOut.append(liOut)
        totalVal += output.value
      })
      const li = $('<li/>').attr('class', 'list-group-item')
      const total = $('<span />').text(`Total Value: $${totalVal / Math.pow(10, 8) * priceOfBitcoin}`)
      li.append(spanHash)
      li.append(spanTime)
      li.append(ulOut)
      li.append($('<br />'))
      li.append(total)

      if ($('#main li').length < 25) {
        window.console.log('Appending li....')
        mainList.append(li)
      } else {
        window.console.info('Emptying list...')
        mainList.empty()
      }
    })
    
    // end loop...
    if (socketObj.getSocketState() !== 'OPEN') {
      window.console.log(`Socket state is: ${socketObj.getSocketState()}. Closing connection...`)
      socketObj.closeConnection()
      clearInterval(0)
    }
  } else {
    clearInterval(0)
  }
}

function main () {
  if (Helpers.hasDependencies()) {
    window.console.info(`Application - Bitcoin Unconfirmed Transactions`)
    const unconfirmedTxs = new UnconfirmedTransactions({
      url: DATA_SRC
    })
    // socketObj.sendMessage({ "op": "unconfirmed_sub" })
    unconfirmedTxs.bindEventOnSocketMessage((ev) => {
      window.console.info('Socket Connection State:', unconfirmedTxs.getSocketState())
      // window.console.info('Message received:', ev.data)
      const data = JSON.parse(ev.data)
      if (data.x) {
        txs = Helpers.addToArr(LIMIT, txs, {
          time: Date(data.x.time),
          txHash: data.x.hash,
          output: data.x.out
        })
        window.console.log('txs ->', txs)
      }
    })
    setInterval(() => {
      unconfirmedTxs.sendMessage({ "op": "unconfirmed_sub" })
      loop({ socketState: unconfirmedTxs.getSocketState() }, unconfirmedTxs)
    }, UPDATE_INTERVAL)
  }
}