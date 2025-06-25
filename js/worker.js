onmessage = (e) => {
    console.log('worker: message received from main thread')
    console.log(e)
}