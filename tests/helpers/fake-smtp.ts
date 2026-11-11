import net from "node:net";

export type Captured = { from: string; to: string[]; data: string };

/** A tiny SMTP server that accepts mail without auth and records what it receives. */
export async function startFakeSmtp() {
  const messages: Captured[] = [];
  const server = net.createServer((socket) => {
    let current: Captured = { from: "", to: [], data: "" };
    let inData = false;
    let buffer = "";
    socket.write("220 fake ESMTP\r\n");
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      for (;;) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end === -1) return;
          current.data = buffer.slice(0, end);
          buffer = buffer.slice(end + 5);
          inData = false;
          messages.push(current);
          current = { from: "", to: [], data: "" };
          socket.write("250 queued\r\n");
          continue;
        }
        const eol = buffer.indexOf("\r\n");
        if (eol === -1) return;
        const line = buffer.slice(0, eol);
        buffer = buffer.slice(eol + 2);
        const cmd = line.toUpperCase();
        if (cmd.startsWith("EHLO") || cmd.startsWith("HELO")) socket.write("250-fake\r\n250 8BITMIME\r\n");
        else if (cmd.startsWith("MAIL FROM")) {
          current.from = line.slice(10).replace(/[<>]/g, "").split(" ")[0];
          socket.write("250 ok\r\n");
        } else if (cmd.startsWith("RCPT TO")) {
          current.to.push(line.slice(8).replace(/[<>]/g, ""));
          socket.write("250 ok\r\n");
        } else if (cmd === "DATA") {
          inData = true;
          socket.write("354 go\r\n");
        } else if (cmd === "QUIT") {
          socket.write("221 bye\r\n");
          socket.end();
        } else if (cmd === "RSET" || cmd === "NOOP") socket.write("250 ok\r\n");
        else socket.write("250 ok\r\n");
      }
    });
    socket.on("error", () => undefined);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as net.AddressInfo).port;
  return { port, messages, close: () => new Promise<void>((resolve) => server.close(() => resolve())) };
}

/** A port nothing listens on, to simulate a mail server that is down. */
export async function closedPort(): Promise<number> {
  const server = net.createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as net.AddressInfo).port;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}
