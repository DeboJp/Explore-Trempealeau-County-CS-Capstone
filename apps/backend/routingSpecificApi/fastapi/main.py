# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import logging

logger = logging.getLogger("uvicorn.error")

app = FastAPI()

# OSRM server (inside Docker) exposed on your Mac at port 4000
OSRM_URL = "http://localhost:4000"


class Point(BaseModel):
    latitude: float
    longitude: float


class RouteRequest(BaseModel):
    origin: Point
    destination: Point


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/route")
def route(req: RouteRequest):
    """
    Takes origin & destination in (lat, lon),
    calls OSRM (foot profile), and returns
    a React Native–friendly list of coordinates
    plus distance & duration.
    """
    logger.info(f"Route request: {req}")
    o = req.origin
    d = req.destination

    # OSRM wants lon,lat order
    coords_str = f"{o.longitude},{o.latitude};{d.longitude},{d.latitude}"

    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "false",
    }

    try:
        osrm_res = requests.get(
            f"{OSRM_URL}/route/v1/foot/{coords_str}",
            params=params,
            timeout=5,
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"OSRM error: {e}")

    if osrm_res.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"OSRM status {osrm_res.status_code}: {osrm_res.text}",
        )

    logger.info(f"OSRM URL: {osrm_res.url}")
    logger.info(f"OSRM response code: {osrm_res.status_code}")

    data = osrm_res.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        # No route found
        return {"coords": [], "distance_m": None, "duration_s": None}

    route0 = data["routes"][0]
    geometry = route0["geometry"]        # GeoJSON LineString
    distance_m = route0["distance"]      # meters
    duration_s = route0["duration"]      # seconds

    # Convert [lon, lat] → { latitude, longitude } for React Native
    coords = [
        {"latitude": lat, "longitude": lon}
        for (lon, lat) in geometry["coordinates"]
    ]

    return {
        "coords": coords,
        "distance_m": distance_m,
        "duration_s": duration_s,
    }
