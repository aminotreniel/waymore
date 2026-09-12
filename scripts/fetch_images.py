#!/usr/bin/env python3
"""
Fetches the openly-licensed placeholder photography used by the Way More
prototype into public/images/.

Two sources:
  * Wikimedia Commons  - accurate, model-specific vehicle photography
  * Unsplash CDN       - lifestyle / marketing photography

Re-runnable.  `python3 scripts/fetch_images.py --force` re-downloads
everything.  Every filename here is referenced only from src/lib/images.ts,
so swapping in Way More's own brand photography is a one-file change.
Attribution for whatever is downloaded lands in public/images/CREDITS.json.
"""
import json, re, sys, urllib.parse, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = "WayMorePrototype/1.0 (asset fetch; contact: dev@trywaymore.com)"
API = "https://commons.wikimedia.org/w/api.php"
FORCE = "--force" in sys.argv

# ---------------------------------------------------------------- vehicles
# (output path, commons search query, result index, thumb width)
COMMONS = [
    ("vehicles/honda-accord-2019.jpg",      "2019 Honda Accord 1.5T Sport",       0, 1400),
    ("vehicles/honda-accord-2019-b.jpg",    "Honda Accord tenth generation CV side-rear", 0, 1400),
    ("vehicles/ford-f150-2021.jpg",         "2021 Ford F-150 Lariat",             0, 1400),
    ("vehicles/chevrolet-equinox-2020.jpg", "2020 Chevrolet Equinox SIAM",        0, 1400),
    ("vehicles/toyota-rav4-2022.jpg",       "Toyota RAV4 XA50",                   0, 1400),
    ("vehicles/jeep-wrangler-2020.jpg",     "2020 Jeep Wrangler Rubicon",         0, 1400),
    ("vehicles/acura-rdx-2019.jpg",         "Acura RDX III 2019",                 0, 1400),
    ("vehicles/nissan-altima-2019.jpg",     "2019 Nissan Altima",                 0, 1400),
    ("vehicles/hyundai-tucson-2022.jpg",    "2022 Hyundai Tucson NX4",            0, 1400),
    ("vehicles/ram-1500-2019.jpg",          "2019 Ram 1500 Laramie",              0, 1400),
    ("vehicles/mazda-cx5-2017.jpg",         "2017 Mazda CX-5 KF",                 0, 1400),
    ("vehicles/kia-telluride-2022.jpg",     "2022 Kia Telluride",                 0, 1400),
    ("vehicles/ford-explorer-2020.jpg",     "2020 Ford Explorer sixth generation",0, 1400),
    ("vehicles/tesla-model-s.jpg",          "Tesla Model S facelift 2021",        0, 1400),
    ("side-mirror.jpg",                     "car side mirror road reflection",    0, 1600),
    ("open-road.jpg",                       "open road landscape driving",        0, 1920),
    ("vehicles/toyota-tacoma-2019.jpg",     "2019 Toyota Tacoma TRD",             0, 1400),
    ("vehicles/honda-civic-2020.jpg",       "2020 Honda Civic FC sedan",          0, 1400),
    ("vehicles/gmc-sierra-2021.jpg",        "2021 GMC Sierra 1500",               0, 1400),
]

# ------------------------------------------------------- marketing / brand
# (output path, unsplash photo id, width)
UNSPLASH = [
    ("hero-road.jpg",       "1568605117036-5fe5e7bab0b7", 2000),
    ("sunset-drive.jpg",    "1494905998402-395d579af36f", 2000),
    ("steering-wheel.jpg",  "1449965408869-eaa3f722e40d", 2000),
    ("dealer-lot.jpg",      "1506521781263-d8422e82f27a", 2000),
    ("handshake.jpg",       "1521791136064-7986c2920216", 1200),
    ("phone-photo.jpg",     "1512428559087-560fa5ceab42", 1200),
    ("highway.jpg",         "1503376780353-7e6692767b70", 2000),
    ("working.jpg",         "1503945438517-f65904a52ce6", 1200),
    ("vehicles/bmw-3series-2018.jpg", "1546614042-7df3c24c9e5d",    1400),
    ("vehicles/vw-jetta-2019.jpg",    "1541899481282-d53bffe3c35d", 1400),
    ("vehicles/honda-crv-2019.jpg",   "1519641471654-76ce0107ad1b", 1400),
]


def _plain(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()[:140]


def _get(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        body = r.read()
    if len(body) < 5_000:
        raise ValueError(f"suspiciously small ({len(body)}b)")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(body)
    return len(body)


def commons_lookup(query, index, width):
    params = {
        "action": "query", "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}", "gsrlimit": "8",
        "gsrnamespace": "6", "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": str(width), "format": "json",
    }
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params),
                                 headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    pages = (data.get("query") or {}).get("pages") or {}
    hits = []
    for p in sorted(pages.values(), key=lambda p: p.get("index", 999)):
        ii = (p.get("imageinfo") or [{}])[0]
        url = ii.get("thumburl") or ii.get("url")
        if not url:
            continue
        meta = ii.get("extmetadata") or {}
        hits.append({
            "url": url.split("?")[0],
            "title": p["title"][5:],
            "credit": _plain(meta.get("Artist", {}).get("value")),
            "license": meta.get("LicenseShortName", {}).get("value", ""),
            "source": ii.get("descriptionurl", "https://commons.wikimedia.org"),
        })
    if not hits:
        return None
    return hits[index] if len(hits) > index else hits[0]


def main():
    credits, failures = [], []

    for rel, query, idx, width in COMMONS:
        dest = ROOT / "public" / "images" / rel
        cached = dest.exists() and dest.stat().st_size > 10_000 and not FORCE
        try:
            hit = commons_lookup(query, idx, width)
            if not hit:
                raise ValueError("no search results")
            if cached:
                print(f"  ==  {rel} (cached)")
            else:
                size = _get(hit["url"], dest)
                print(f"  ++  {rel}  <-  {hit['title'][:58]} ({size//1024}kb)")
            credits.append({"file": f"images/{rel}", "provider": "Wikimedia Commons", **hit})
        except Exception as e:
            print(f"  !!  {rel}: {e}")
            failures.append(rel)

    for rel, photo_id, width in UNSPLASH:
        dest = ROOT / "public" / "images" / rel
        url = f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&q=80"
        cached = dest.exists() and dest.stat().st_size > 10_000 and not FORCE
        try:
            if cached:
                print(f"  ==  {rel} (cached)")
            else:
                size = _get(url, dest)
                print(f"  ++  {rel}  <-  unsplash/{photo_id} ({size//1024}kb)")
            credits.append({
                "file": f"images/{rel}", "provider": "Unsplash",
                "title": photo_id, "credit": "Unsplash contributor",
                "license": "Unsplash License",
                "source": f"https://unsplash.com/photos/{photo_id}",
            })
        except Exception as e:
            print(f"  !!  {rel}: {e}")
            failures.append(rel)

    out = ROOT / "public" / "images" / "CREDITS.json"
    out.write_text(json.dumps(sorted(credits, key=lambda c: c["file"]), indent=2) + "\n")

    print(f"\n{len(credits)} assets recorded, {len(failures)} failed. "
          f"Attribution -> public/images/CREDITS.json")
    if failures:
        print("failed:", ", ".join(failures))


if __name__ == "__main__":
    main()
