from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socket
import time
from ping3 import ping

app = FastAPI()

# Allow frontend requests from any origin (CORS bypass)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dns")
def resolve_dns(domain: str):
    # Resolve domain name to IPv4 address using socket
    try:
        ip_address = socket.gethostbyname(domain)
        return {"domain": domain, "ip": ip_address, "status": "success"}
    except socket.gaierror:
        return {"error": "Domain not found", "status": "error"}

@app.get("/api/portscan")
def scan_port(host: str, port: int):
    # Check if a specific TCP port is open on the target host
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2.0)
    try:
        start_time = time.time()
        s.connect((host, port))
        latency = (time.time() - start_time) * 1000
        s.close()
        return {"port": port, "state": "open", "latency_ms": round(latency)}
    except (socket.timeout, ConnectionRefusedError):
        return {"port": port, "state": "closed"}

@app.get("/api/ping")
def ping_host(host: str):
    # Send a real ICMP echo request to the target host
    try:
        delay = ping(host, timeout=2)
        if delay is None:
            return {"host": host, "state": "down"}
        # ping3 returns delay in seconds, convert to milliseconds
        return {"host": host, "state": "up", "latency_ms": round(delay * 1000)}
    except Exception as e:
        return {"host": host, "state": "error", "message": str(e)}