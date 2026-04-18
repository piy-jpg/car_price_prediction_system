import json
import sys

import pandas as pd


def format_price_inr(price: float) -> str:
    if price >= 10000000:
        crores = price / 10000000
        return f"{crores:.1f} crore" if crores >= 10 else f"{crores:.2f} crore"
    if price >= 100000:
        lakhs = price / 100000
        return f"{lakhs:.0f} lakh" if lakhs >= 10 else f"{lakhs:.1f} lakh"
    return f"Rs {price:,.0f}"


def load_dataset():
    dataset = pd.read_csv("Cleaned_Car_data.csv")
    dataset["company_key"] = dataset["company"].astype(str).str.strip().str.casefold()
    dataset["name_key"] = dataset["name"].astype(str).str.strip().str.casefold()
    dataset["fuel_key"] = dataset["fuel_type"].astype(str).str.strip().str.casefold()
    return dataset


DATASET = load_dataset()


def parse_input():
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    return json.loads(raw)


def validate_payload(payload):
    required_fields = ["company", "car_model", "year", "kilo_driven", "fuel_type"]
    missing_fields = [field for field in required_fields if field not in payload or payload[field] in ("", None)]
    if missing_fields:
        raise ValueError(f"Missing field(s): {', '.join(missing_fields)}")


def resolve_price(payload):
    company = str(payload["company"]).strip()
    car_model = str(payload["car_model"]).strip()
    year = int(payload["year"])
    kilo_driven = int(payload["kilo_driven"])
    fuel_type = str(payload["fuel_type"]).strip()

    company_key = company.casefold()
    model_key = car_model.casefold()
    fuel_key = fuel_type.casefold()

    exact_matches = DATASET[
        (DATASET["company_key"] == company_key)
        & (DATASET["name_key"] == model_key)
        & (DATASET["year"] == year)
        & (DATASET["fuel_key"] == fuel_key)
    ].copy()

    if not exact_matches.empty:
        exact_matches["kms_gap"] = (exact_matches["kms_driven"] - kilo_driven).abs()
        best_matches = exact_matches.nsmallest(min(3, len(exact_matches)), ["kms_gap"])
        price = float(best_matches["Price"].median())
        match_type = "exact"
        matched_records = int(len(exact_matches))
    else:
        fallback_sets = [
            (
                "same_model_year",
                (DATASET["company_key"] == company_key)
                & (DATASET["name_key"] == model_key)
                & (DATASET["year"] == year),
            ),
            (
                "same_model_fuel",
                (DATASET["company_key"] == company_key)
                & (DATASET["name_key"] == model_key)
                & (DATASET["fuel_key"] == fuel_key),
            ),
            (
                "same_model",
                (DATASET["company_key"] == company_key)
                & (DATASET["name_key"] == model_key),
            ),
            ("same_company", DATASET["company_key"] == company_key),
        ]

        best_matches = None
        match_type = "fallback"
        matched_records = 0

        for candidate_type, mask in fallback_sets:
            candidates = DATASET[mask].copy()
            if candidates.empty:
                continue

            candidates["year_gap"] = (candidates["year"] - year).abs()
            candidates["kms_gap"] = (candidates["kms_driven"] - kilo_driven).abs()
            best_matches = candidates.nsmallest(min(5, len(candidates)), ["year_gap", "kms_gap"])
            match_type = candidate_type
            matched_records = int(mask.sum())
            break

        if best_matches is None or best_matches.empty:
            raise ValueError("No matching car records found in the original dataset")

        price = float(best_matches["Price"].median())

    return {
        "success": True,
        "predicted_price": format_price_inr(price),
        "actual_price": f"Rs {price:,.2f}",
        "price_numeric": price,
        "input_data": {
            "company": company,
            "model": car_model,
            "year": year,
            "kilometers_driven": kilo_driven,
            "fuel_type": fuel_type,
        },
        "price_source": "original_dataset",
        "match_type": match_type,
        "matched_records": matched_records,
    }


def main():
    payload = parse_input()
    validate_payload(payload)
    print(json.dumps(resolve_price(payload)))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # pragma: no cover - CLI error path
        print(str(error), file=sys.stderr)
        sys.exit(1)
