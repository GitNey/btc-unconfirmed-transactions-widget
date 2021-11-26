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
