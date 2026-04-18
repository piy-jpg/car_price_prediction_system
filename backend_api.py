from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)


def load_dataset():
    dataset = pd.read_csv('Cleaned_Car_data.csv')
    dataset['company_key'] = dataset['company'].astype(str).str.strip().str.casefold()
    dataset['name_key'] = dataset['name'].astype(str).str.strip().str.casefold()
    dataset['fuel_key'] = dataset['fuel_type'].astype(str).str.strip().str.casefold()
    return dataset


try:
    car_data = load_dataset()
    print("Original car dataset loaded successfully")
except Exception as e:
    print(f"Error loading dataset: {e}")
    car_data = None


def format_price_inr(price):
    if price >= 10000000:
        crores = price / 10000000
        return f"{crores:.1f} crore" if crores >= 10 else f"{crores:.2f} crore"
    if price >= 100000:
        lakhs = price / 100000
        return f"{lakhs:.0f} lakh" if lakhs >= 10 else f"{lakhs:.1f} lakh"
    return f"Rs {price:,.0f}"


def resolve_price(data):
    company = str(data['company']).strip()
    car_model = str(data['car_model']).strip()
    year = int(data['year'])
    driven = int(data['kilo_driven'])
    fuel_type = str(data['fuel_type']).strip()

    company_key = company.casefold()
    model_key = car_model.casefold()
    fuel_key = fuel_type.casefold()

    exact_matches = car_data[
        (car_data['company_key'] == company_key) &
        (car_data['name_key'] == model_key) &
        (car_data['year'] == year) &
        (car_data['fuel_key'] == fuel_key)
    ].copy()

    if not exact_matches.empty:
        exact_matches['kms_gap'] = (exact_matches['kms_driven'] - driven).abs()
        best_matches = exact_matches.nsmallest(min(3, len(exact_matches)), 'kms_gap')
        price = float(best_matches['Price'].median())
        match_type = 'exact'
        matched_records = int(len(exact_matches))
    else:
        fallback_sets = [
            ('same_model_year', (
                (car_data['company_key'] == company_key) &
                (car_data['name_key'] == model_key) &
                (car_data['year'] == year)
            )),
            ('same_model_fuel', (
                (car_data['company_key'] == company_key) &
                (car_data['name_key'] == model_key) &
                (car_data['fuel_key'] == fuel_key)
            )),
            ('same_model', (
                (car_data['company_key'] == company_key) &
                (car_data['name_key'] == model_key)
            )),
            ('same_company', car_data['company_key'] == company_key),
        ]

        best_matches = None
        match_type = 'fallback'
        matched_records = 0

        for candidate_type, mask in fallback_sets:
            candidates = car_data[mask].copy()
            if candidates.empty:
                continue
            candidates['year_gap'] = (candidates['year'] - year).abs()
            candidates['kms_gap'] = (candidates['kms_driven'] - driven).abs()
            best_matches = candidates.nsmallest(min(5, len(candidates)), ['year_gap', 'kms_gap'])
            match_type = candidate_type
            matched_records = int(mask.sum())
            break

        if best_matches is None or best_matches.empty:
            raise ValueError('No matching car records found in the original dataset')

        price = float(best_matches['Price'].median())

    return {
        'success': True,
        'predicted_price': format_price_inr(price),
        'actual_price': f"Rs {price:,.2f}",
        'price_numeric': price,
        'input_data': {
            'company': company,
            'model': car_model,
            'year': year,
            'kilometers_driven': driven,
            'fuel_type': fuel_type
        },
        'price_source': 'original_dataset',
        'match_type': match_type,
        'matched_records': matched_records
    }


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': car_data is not None,
        'dataset_size': len(car_data) if car_data is not None else 0
    })


@app.route('/api/companies', methods=['GET'])
def get_companies():
    if car_data is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    companies = sorted(car_data['company'].unique())
    return jsonify({'companies': companies})


@app.route('/api/models/<company>', methods=['GET'])
def get_models(company):
    if car_data is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    models = car_data[car_data['company'] == company]['name'].unique()
    return jsonify({'models': sorted(models)})


@app.route('/api/years', methods=['GET'])
def get_years():
    if car_data is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    years = sorted([int(year) for year in car_data['year'].unique()], reverse=True)
    return jsonify({'years': years})


@app.route('/api/fuel_types', methods=['GET'])
def get_fuel_types():
    if car_data is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    fuel_types = list(car_data['fuel_type'].unique())
    return jsonify({'fuel_types': fuel_types})


@app.route('/api/predict', methods=['POST'])
def predict_price():
    if car_data is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    try:
        data = request.get_json()
        required_fields = ['company', 'car_model', 'year', 'kilo_driven', 'fuel_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400

        return jsonify(resolve_price(data))

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    if car_data is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    stats = {
        'total_vehicles': len(car_data),
        'companies': len(car_data['company'].unique()),
        'models': len(car_data['name'].unique()),
        'year_range': [int(car_data['year'].min()), int(car_data['year'].max())],
        'fuel_types': list(car_data['fuel_type'].unique()),
        'avg_price': f"Rs {car_data['Price'].mean():,.0f}",
        'price_range': [f"Rs {car_data['Price'].min():,.0f}", f"Rs {car_data['Price'].max():,.0f}"]
    }

    return jsonify(stats)


@app.route('/api/dataset/sample', methods=['GET'])
def get_sample_data():
    if car_data is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    sample = car_data.head(10).to_dict('records')
    return jsonify({'sample': sample})


@app.route('/api/dataset', methods=['GET'])
def get_full_dataset():
    if car_data is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    records = car_data.to_dict('records')
    return jsonify({
        'records': records,
        'total': len(records)
    })


if __name__ == '__main__':
    print("Starting Car Price Predictor Backend API...")
    app.run(debug=True, host='0.0.0.0', port=5001)
