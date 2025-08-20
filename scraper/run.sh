#!/bin/sh
set -eu

trap 'echo "[scraper] stop"; exit 0' INT TERM

# Paramètres
MAX_ID="${MAX_ID:-25000}"           # borne max des IDs
BATCH="${BATCH:-1500}"              # taille de lot par run
WAIT_MIN_HOURS="${WAIT_MIN_HOURS:-24}"   # attente min entre 2 runs
WAIT_MAX_HOURS="${WAIT_MAX_HOURS:-48}"   # attente max entre 2 runs
PAUSE_MIN_SEC="${PAUSE_MIN_SEC:-10}"     # pause min entre étapes d'un run
PAUSE_MAX_SEC="${PAUSE_MAX_SEC:-45}"     # pause max entre étapes d'un run
RETRIES="${RETRIES:-3}"                  # tentatives par étape en cas d'échec
ONE_SHOT="${ONE_SHOT:-0}"                # 1 pour exécuter un seul cycle et sortir

# Scripts JS compilés - noms tels que listés par 'ls -lah dist/scraping'
COASTERS_JS="dist/scraping/main.js"
MAP_JS="dist/scraping/map-coaster-photos.js"
PARKS_JS="dist/scraping/scrape-theme-parks.js"
RANDOM_JS="dist/scraping/scrape-random-coasters.js"

# Utilitaires
rand_int() { node -e "const a=Number(process.argv[1]),b=Number(process.argv[2]); console.log(Math.floor(Math.random()*(b-a+1))+a)" "$1" "$2"; }
sleep_rand() { sec="$(rand_int "$1" "$2")"; echo "[scraper] sleep ${sec}s..."; sleep "$sec"; }

backoff_run() {
  name="$1"; shift
  i=1
  until "$@"; do
    code=$?
    if [ "$i" -ge "$RETRIES" ]; then
      echo "[scraper] ${name} failed after ${RETRIES} tries (code ${code})"
      return "$code"
    fi
    wait=$((i*i*30))  # 30s, 120s, 270s...
    echo "[scraper] ${name} failed (try ${i}), backoff ${wait}s"
    sleep "$wait"
    i=$((i+1))
  done
}

while true; do
  # Attente aléatoire 24-48h
  min_s=$((WAIT_MIN_HOURS*3600))
  max_s=$((WAIT_MAX_HOURS*3600))
  delay="$(rand_int "$min_s" "$max_s")"
  h=$((delay/3600))
  echo "[scraper] next run in ${delay}s (~${h}h)"
  sleep "$delay"

  # Choix d'une fenêtre d'IDs aléatoire
  if [ "$MAX_ID" -lt "$BATCH" ]; then
    start=0
  else
    start="$(rand_int 0 $((MAX_ID-BATCH)))"
  fi
  end=$((start+BATCH))
  echo "[scraper] coasters ${start}-${end}"

  # 1) Coasters
  backoff_run "coasters" node "$COASTERS_JS" --startId "$start" --endId "$end" --saveData true || true
  sleep_rand "$PAUSE_MIN_SEC" "$PAUSE_MAX_SEC"

  # 2) Mapping photos
  echo "[scraper] map photos ${start}-${end}"
  backoff_run "map" node "$MAP_JS" --startId "$start" --endId "$end" --saveData true || true
  sleep_rand "$PAUSE_MIN_SEC" "$PAUSE_MAX_SEC"

  # 3) 1 run sur 4 - refresh parcs
  if [ "$(rand_int 1 4)" -eq 1 ]; then
    echo "[scraper] theme-parks refresh"
    backoff_run "theme-parks" node "$PARKS_JS" || true
    sleep_rand "$PAUSE_MIN_SEC" "$PAUSE_MAX_SEC"
  fi

  # 4) 1 run sur 4 - échantillon aléatoire
  if [ -f "$RANDOM_JS" ] && [ "$(rand_int 1 4)" -eq 1 ]; then
    echo "[scraper] random coasters sample"
    backoff_run "random-coasters" node "$RANDOM_JS" || true
  fi

  # Trace du dernier passage
  date -u +"%Y-%m-%dT%H:%M:%SZ" > /app/src/db/.last-scrape

  echo "[scraper] cycle done"

  # Mode one-shot - pratique pour tester
  if [ "$ONE_SHOT" = "1" ]; then
    echo "[scraper] one-shot mode, exiting"
    exit 0
  fi
done

