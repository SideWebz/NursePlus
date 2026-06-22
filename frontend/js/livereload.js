(() => {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  const url = `${proto}//${location.host}/__livereload`;
  let connected = false;

  const connect = () => {
    const ws = new WebSocket(url);

    ws.addEventListener("open", () => { connected = true; });

    ws.addEventListener("close", () => {
      if (connected) {
        location.reload();
      } else {
        setTimeout(connect, 250);
      }
    });

    ws.addEventListener("error", () => ws.close());
  };

  connect();
})();
