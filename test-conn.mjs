import net from 'net';

const hosts = [
  { host: 'aws-1-ap-southeast-1.pooler.supabase.com', port: 6543 },
  { host: 'aws-1-ap-southeast-1.pooler.supabase.com', port: 5432 },
];

for (const { host, port } of hosts) {
  const socket = net.createConnection(port, host, () => {
    console.log(`Connected to ${host}:${port}`);
    socket.end();
  });
  socket.on('error', (err) => {
    console.error(`Failed ${host}:${port} - ${err.message}`);
  });
}
