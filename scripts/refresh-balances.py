#!/usr/bin/env python3
"""
refresh-balances.py — pull current loyalty balances from AwardWallet and
write to ./profile.json -> points block. Requires AwardWallet+ paid tier
+ API key.

Setup:
  1. Run: bash scripts/setup-keys.sh (creates .env)
  2. Edit .env: set AWARDWALLET_API_KEY + AWARDWALLET_USER_ID
  3. Run this script: python3 scripts/refresh-balances.py

Without keys: prints helpful message + exits clean (no error).
"""

import datetime as dt
import json
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PROFILE_PATH = Path(os.environ.get("CARD_HACKER_PROFILE_PATH", REPO_ROOT / "profile.json"))


def load_env():
    env_path = REPO_ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())


def main() -> int:
    load_env()
    api_key = os.environ.get("AWARDWALLET_API_KEY", "").strip()
    user_id = os.environ.get("AWARDWALLET_USER_ID", "").strip()

    if not api_key or not user_id:
        print(
            "AwardWallet API key not configured. To enable:\n"
            "  1. bash scripts/setup-keys.sh\n"
            "  2. Edit .env and set AWARDWALLET_API_KEY + AWARDWALLET_USER_ID\n"
            "  3. Re-run this script\n"
            "\nWithout the key, you can manually update profile.json -> points "
            "block during /credit-card-hacker:portfolio-review."
        )
        return 0

    if not PROFILE_PATH.exists():
        print(
            f"Profile does not exist at {PROFILE_PATH}.\n"
            "Run /credit-card-hacker:getting-started in Claude Code first."
        )
        return 1

    try:
        import requests  # type: ignore
    except ImportError:
        print("ERROR: 'requests' not installed. pip install requests")
        return 2

    # Note: real AwardWallet API endpoint shape may differ; verify at
    # https://awardwallet.com/api/v1/docs (requires AwardWallet+).
    url = f"https://business.awardwallet.com/api/export/v1/Members/{user_id}"
    resp = requests.get(url, params={"AccessKey": api_key}, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    program_map = {
        "Chase Ultimate Rewards": "chase_ur",
        "American Express Membership Rewards": "amex_mr",
        "Citi ThankYou Points": "citi_typ",
        "Capital One Miles": "capone_miles",
        "Bilt Rewards": "bilt",
        "World of Hyatt": "hyatt",
        "United MileagePlus": "united",
        "American AAdvantage": "aa",
        "Delta SkyMiles": "delta",
        "Hilton Honors": "hilton",
        "Marriott Bonvoy": "marriott",
        "Alaska Mileage Plan": "alaska",
        "Air Canada Aeroplan": "aeroplan",
        "Southwest Rapid Rewards": "southwest",
        "British Airways Avios": "avios",
        "Air France/KLM Flying Blue": "flying_blue",
        "ANA Mileage Club": "ana",
        "Singapore KrisFlyer": "singapore",
        "Virgin Atlantic Flying Club": "virgin_atlantic",
    }

    profile = json.loads(PROFILE_PATH.read_text())
    profile.setdefault("points", {})

    updated = 0
    for account in data.get("accounts", []):
        name = account.get("displayName") or account.get("kind", {}).get("name", "")
        try:
            balance = int(account.get("balanceRaw", 0))
        except (TypeError, ValueError):
            continue
        key = program_map.get(name)
        if key:
            profile["points"][key] = balance
            updated += 1

    profile["points"]["awardwallet_synced"] = True
    profile["points"]["last_synced_at"] = dt.datetime.now().isoformat()

    PROFILE_PATH.write_text(json.dumps(profile, indent=2))
    print(f"Updated {updated} program balances in {PROFILE_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
