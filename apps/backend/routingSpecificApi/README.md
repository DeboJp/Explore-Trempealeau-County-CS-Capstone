# Routing Backend (OSRM + FastAPI)

This folder contains everything needed to power the **routing** feature used by this app:

- An **OSRM** server in Docker, backed by prebuilt data for Trempealeau County walking routes.
- A small **FastAPI** service that the mobile app calls for `/route` and `/health`.

The mobile app never calls OSRM directly.  
It only talks to FastAPI over HTTP.

---

## Folder structure

```bash
routingSpecificbackend/
├── README.md
├── fastapi/
│   ├── main.py          # FastAPI app (routing API)
│   ├── requirements.txt # Python dependencies
│   └── start_api.sh     # helper: set up venv + run uvicorn
└── osrm-data-T/
    ├── region.osrm.pbf      # original OSRM data for Trempealeau area
    ├── region.osrm.*    # other OSRM files
    └── start_osrm.sh    # helper: run OSRM Docker container
```

## About the OSRM data

- These files were already processed to keep only walking routes in and around Trempealeau County.

- region.osm.pbf is the original extract; the rest are OSRM’s internal routing files, can be used to create driving and other route styles.

- This data is static: it will not change unless someone explicitly regenerates the .osrm* files. i.e. new region.osm.pbf downloaded for trempealeau county and walking/driving/etc routes generated.

## Network assumptions (important)

Right now this backend is meant for local networks only:

- devices on school Wi-Fi, organization / office Wi-Fi, or home Wi-Fi, all on the same network.

- Phones/tablets talk to http://"server-ip":8000 (FastAPI) inside that network.

It is not configured for the open internet (no HTTPS, no auth, no hardening).
If you ever want to expose it publicly, you’d put it behind a proper web server (TLS, auth, etc.) or follow the AWS architecture proposal.

## 0. Prerequisites

On the machine that will host routing (the “server”):

- Docker installed and running.

- Python 3.10+ and pip.

- The machine and the phones/tablets are on the same Wi-Fi / LAN.

- Firewall allows incoming connections on (numbers can be changed.):

    - 4000 (OSRM – used by FastAPI only),

    - 8000 (FastAPI – used by the mobile app).


## 1. Start OSRM (routing engine)

From the OSRM data folder:

```bash
cd routingSpecificApi/osrm-data-T
./start_osrm.sh
```

If the script doesn’t run:

Make it executable:

```bash
chmod +x start_osrm.sh
./start_osrm.sh
```

If you still prefer to run it manually, the script is basically doing (but make sure to run Docker app first or start docker from cli):

```bash
docker run --rm -t -i \
  -p 4000:5000 \
  -v "$(pwd)":/data \
  osrm/osrm-backend \
  osrm-routed /data/region.osrm
```

What this gives you:

OSRM is now listening on http://localhost:4000 on that same machine.

It knows about the pre-built Trempealeau walking network sitting in region.osrm*.

## 2. Start FastAPI (routing API)

From the FastAPI folder:

```bash
cd routingSpecificApi/fastapi
./start_api.sh
```

If the script doesn’t run, same story:

```bash
chmod +x start_api.sh
./start_api.sh
```

Or do it by hand:

```bash
cd routingSpecificApi/fastapi

python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI will then be reachable at:

```bash
http://0.0.0.0:8000   # from the server itself
http://<server-ip>:8000  # from phones / other devices on the network
```

Quick sanity check(curl or just put that link on google):

```bash
curl http://localhost:8000/health
```

You should see:

```json
{"status":"ok"}
```

## 3. Point the mobile app at the server

In the `React Native MapScreen` file there is a line like:

``` ts
const API_BASE = "http://xxx.xxx.x.xxx:8000";
``` 

This needs to be updated to the actual IP address of the `server` on the local network (server is the laptop/device running these files-server and mobile app running devices dont have to be separate devices but can be).

####  How to find the server IP:

On macOS (Wi-Fi on en0):

``` bash
ipconfig getifaddr en0
```

If you’re using a different interface (e.g. Ethernet), you may need en1 instead.

On Linux (roughly):
``` bash
ip addr
```

Look for an address like 192.168.x.x or 10.x.x.x.

On Windows (PowerShell or CMD):
``` bash
ipconfig
```

Once you have the IP, update API_BASE:

``` ts
const API_BASE = "http://<SERVER_IP>:8000";  // e.g. "http://xxx.xxx.x.xx:8000"
```

Rebuild/restart the app so it picks up the new value.

As long as:

- OSRM is running (step 1),

- FastAPI is running (step 2),

- and the mobile device is on the same Wi-Fi/network as <SERVER_IP>,

routing requests from the app should work.

## 4. Updating the OSRM data later (optional)

Right now the OSRM dataset in osrm-data-T/:

- uses walking (foot) routing,

- covers Trempealeau County + some surrounding area,

- is fixed to whatever date the OSM extract was created.

If someone wants to change it:

- Start from region.osm.pbf (or a newer .osm.pbf extract).

- I ran a docker pipeline as follows, other ones can be run as well:

    ```bash
    # 1) Extract from the PBF using the foot profile
    docker run -t -v "$(pwd)":/data osrm/osrm-backend \
    osrm-extract -p /opt/foot.lua /data/region.osm.pbf

    # 2) Build the contracted graph
    docker run -t -v "$(pwd)":/data osrm/osrm-backend \
    osrm-contract /data/region.osrm
    ```
    (check out their website for other commands to run, i.e. newer osrm might use a different cmd flow.)

- Replace the old region.osrm* files in osrm-data-T/ with the new ones.

- Restart the Docker container (`./start_osrm.sh` or `docker run -t -i -p 4000:5000 -v "$(pwd)":/data osrm/osrm-backend \
  osrm-routed /data/region.osrm`
).

The FastAPI API shape stays the same, so the mobile app doesn’t need to change as long as on same network.