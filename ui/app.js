// init
bfWebSocketService.connect().then(() => {
  bfAdd()
  bfList()
  bfTChat()
  bfMenu()
})