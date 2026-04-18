import pandas as pd
import numpy as np
from datetime import datetime
import random

# Real Indian car prices (ex-showroom) - 2024 prices
real_car_prices = {
    # Maruti Suzuki
    'Maruti Suzuki Alto': [350000, 450000],
    'Maruti Suzuki WagonR': [550000, 700000],
    'Maruti Suzuki Celerio': [560000, 700000],
    'Maruti Suzuki Swift': [650000, 950000],
    'Maruti Suzuki Dzire': [680000, 1000000],
    'Maruti Suzuki Baleno': [750000, 1100000],
    'Maruti Suzuki Vitara Brezza': [850000, 1400000],
    'Maruti Suzuki Ertiga': [900000, 1300000],
    'Maruti Suzuki Ciaz': [950000, 1300000],
    'Maruti Suzuki XL6': [1100000, 1400000],
    'Maruti Suzuki Grand Vitara': [1100000, 2000000],
    'Maruti Suzuki Jimny': [1250000, 1500000],
    'Maruti Suzuki Invicto': [2500000, 2900000],
    
    # Tata Motors
    'Tata Tiago': [550000, 800000],
    'Tata Tigor': [600000, 850000],
    'Tata Punch': [600000, 1000000],
    'Tata Altroz': [650000, 1100000],
    'Tata Nexon': [800000, 1800000],
    'Tata Harrier': [1500000, 2500000],
    'Tata Safari': [1600000, 2700000],
    'Tata Curvv': [1200000, 2000000],
    'Tata Nexon EV': [1400000, 1900000],
    'Tata Tiago EV': [800000, 1200000],
    'Tata Punch EV': [1100000, 1500000],
    
    # Hyundai
    'Hyundai Grand i10': [580000, 800000],
    'Hyundai i20': [700000, 1100000],
    'Hyundai Aura': [650000, 900000],
    'Hyundai Venue': [750000, 1300000],
    'Hyundai Creta': [1100000, 2000000],
    'Hyundai Verna': [1100000, 1800000],
    'Hyundai Alcazar': [1600000, 2000000],
    'Hyundai Tucson': [2900000, 3600000],
    'Hyundai Ioniq 5': [4500000, 4800000],
    'Hyundai Exter': [600000, 800000],
    'Hyundai Casper': [600000, 800000],
    
    # Kia
    'Kia Sonet': [750000, 1400000],
    'Kia Seltos': [1100000, 2000000],
    'Kia Carens': [1000000, 1900000],
    'Kia Carnival': [2500000, 3300000],
    'Kia EV6': [6000000, 6500000],
    'Kia EV9': [13000000, 14000000],
    
    # Mahindra
    'Mahindra KUV100': [650000, 850000],
    'Mahindra Bolero': [950000, 1100000],
    'Mahindra Bolero Neo': [950000, 1200000],
    'Mahindra XUV300': [800000, 1400000],
    'Mahindra Scorpio': [1300000, 1800000],
    'Mahindra Scorpio N': [1300000, 2400000],
    'Mahindra XUV700': [1400000, 2600000],
    'Mahindra Thar': [1100000, 1600000],
    'Mahindra Thar 5-Door': [1800000, 2200000],
    'Mahindra XUV400': [1800000, 2100000],
    
    # Honda
    'Honda Amaze': [800000, 1000000],
    'Honda Jazz': [900000, 1100000],
    'Honda City': [1100000, 1500000],
    'Honda City e:HEV': [1900000, 2000000],
    'Honda WR-V': [900000, 1200000],
    'Honda Elevate': [1100000, 1600000],
    'Honda CR-V': [4300000, 4700000],
    
    # Toyota
    'Toyota Glanza': [700000, 900000],
    'Toyota Urban Cruiser Hyryder': [1100000, 2000000],
    'Toyota Innova': [1700000, 2500000],
    'Toyota Innova Hycross': [2000000, 3000000],
    'Toyota Fortuner': [3300000, 4500000],
    'Toyota Fortuner Legender': [4300000, 4800000],
    'Toyota Camry': [4600000, 4800000],
    'Toyota Land Cruiser': [21000000, 23000000],
    'Toyota Hilux': [3000000, 3500000],
    
    # Volkswagen
    'Volkswagen Polo': [700000, 1000000],
    'Volkswagen Ameo': [800000, 1100000],
    'Volkswagen Vento': [1100000, 1500000],
    'Volkswagen Taigun': [1100000, 1900000],
    'Volkswagen Virtus': [1100000, 1800000],
    'Volkswagen Tiguan': [3500000, 3800000],
    
    # Skoda
    'Skoda Rapid': [800000, 1300000],
    'Skoda Slavia': [1100000, 1800000],
    'Skoda Kushaq': [1100000, 1900000],
    'Skoda Octavia': [2700000, 3000000],
    'Skoda Kodiaq': [3800000, 4200000],
    'Skoda Superb': [3200000, 3600000],
    
    # Renault
    'Renault Kwid': [450000, 600000],
    'Renault Triber': [600000, 900000],
    'Renault Kiger': [600000, 1100000],
    'Renault Duster': [1000000, 1500000],
    
    # Nissan
    'Nissan Magnite': [600000, 1100000],
    'Nissan Kicks': [900000, 1100000],
    'Nissan Leaf': [4000000, 4500000],
    
    # MG
    'MG Hector': [1500000, 2100000],
    'MG Astor': [1000000, 1800000],
    'MG ZS EV': [2300000, 2700000],
    'MG Gloster': [3200000, 4000000],
    'MG Comet EV': [700000, 900000],
    'MG 4 EV': [2800000, 3200000],
    
    # Jeep
    'Jeep Compass': [2000000, 3300000],
    'Jeep Meridian': [3000000, 3500000],
    'Jeep Wrangler': [5700000, 6000000],
    'Jeep Grand Cherokee': [8000000, 8500000],
    'Jeep Gladiator': [5700000, 6000000],
    
    # Citroen
    'Citroen C3': [600000, 800000],
    'Citroen eC3': [1200000, 1300000],
    'Citroen C5 Aircross': [3200000, 3500000],
    
    # Luxury Brands - Entry Level
    'BMW X1': [4700000, 5200000],
    'BMW 2 Series': [4500000, 5000000],
    'BMW 3 Series': [5800000, 6500000],
    'Mercedes-Benz A-Class': [4200000, 4700000],
    'Mercedes-Benz C-Class': [5800000, 6800000],
    'Audi A4': [4400000, 5000000],
    'Audi Q3': [4400000, 5000000],
    'Volvo XC40': [4500000, 5000000],
    
    # Mid Luxury
    'BMW X3': [6800000, 7500000],
    'BMW 5 Series': [7200000, 8000000],
    'Mercedes-Benz E-Class': [8000000, 10000000],
    'Mercedes-Benz GLC': [7500000, 8500000],
    'Audi A6': [6600000, 7200000],
    'Audi Q5': [7000000, 7700000],
    'Volvo XC60': [6800000, 7500000],
    'Jaguar XE': [4600000, 5200000],
    'Jaguar XF': [5600000, 6200000],
    'Lexus ES': [6200000, 6800000],
    'Lexus RX': [9500000, 11000000],
    
    # High Luxury
    'BMW X5': [9700000, 11000000],
    'BMW 7 Series': [14000000, 18000000],
    'Mercedes-Benz S-Class': [17000000, 20000000],
    'Mercedes-Benz GLE': [10000000, 12000000],
    'Mercedes-Benz GLS': [12000000, 14000000],
    'Audi A8': [14000000, 16000000],
    'Audi Q7': [8500000, 9500000],
    'Audi Q8': [13000000, 14000000],
    'Volvo XC90': [9800000, 11000000],
    'Jaguar F-Pace': [7800000, 8500000],
    'Jaguar I-Pace': [12000000, 13000000],
    'Land Rover Discovery': [9000000, 10000000],
    'Land Rover Discovery Sport': [6700000, 7200000],
    'Land Rover Range Rover Evoque': [7000000, 7800000],
    'Land Rover Range Rover Velar': [9000000, 10000000],
    'Land Rover Range Rover Sport': [14000000, 16000000],
    'Land Rover Range Rover': [25000000, 40000000],
    
    # Sports Cars
    'Porsche 718 Cayman': [14000000, 16000000],
    'Porsche 718 Boxster': [15000000, 17000000],
    'Porsche 911': [18000000, 35000000],
    'Porsche Panamera': [17000000, 25000000],
    'Porsche Macan': [17000000, 20000000],
    'Porsche Cayenne': [17000000, 25000000],
    'Porsche Taycan': [18000000, 25000000],
    'BMW M2': [9900000, 11000000],
    'BMW M3': [13000000, 15000000],
    'BMW M4': [14000000, 16000000],
    'BMW M5': [18000000, 20000000],
    'BMW Z4': [9000000, 10000000],
    'Mercedes-Benz AMG A35': [5800000, 6200000],
    'Mercedes-Benz AMG A45': [7500000, 8000000],
    'Mercedes-Benz AMG C43': [9000000, 10000000],
    'Mercedes-Benz AMG C63': [15000000, 17000000],
    'Mercedes-Benz AMG E53': [13000000, 14000000],
    'Mercedes-Benz AMG E63': [18000000, 20000000],
    'Mercedes-Benz AMG GT': [27000000, 30000000],
    'Mercedes-Benz AMG GTR': [35000000, 40000000],
    'Audi RS3': [8500000, 9000000],
    'Audi RS5': [12000000, 13000000],
    'Audi RS6': [15000000, 16000000],
    'Audi RS7': [17000000, 18000000],
    'Audi RSQ8': [22000000, 24000000],
    'Audi R8': [22000000, 25000000],
    'Audi e-tron GT': [18000000, 20000000],
    'Audi TT': [6500000, 7000000],
    
    # Supercars
    'Ferrari Roma': [36000000, 40000000],
    'Ferrari Portofino': [38000000, 42000000],
    'Ferrari F8 Tributo': [45000000, 50000000],
    'Ferrari SF90 Stradale': [75000000, 80000000],
    'Ferrari 296 GTB': [55000000, 60000000],
    'Ferrari 812 Superfast': [65000000, 70000000],
    'Lamborghini Huracan': [40000000, 45000000],
    'Lamborghini Urus': [45000000, 50000000],
    'Lamborghini Aventador': [60000000, 70000000],
    'Lamborghini Revuelto': [80000000, 90000000],
    'McLaren 570S': [38000000, 42000000],
    'McLaren 720S': [45000000, 50000000],
    'McLaren 765LT': [55000000, 60000000],
    'McLaren Artura': [52000000, 57000000],
    'McLaren GT': [42000000, 47000000],
    'Aston Martin DB11': [42000000, 47000000],
    'Aston Martin Vantage': [30000000, 35000000],
    'Aston Martin DBX': [38000000, 42000000],
    'Aston Martin DBS Superleggera': [55000000, 60000000],
    'Bentley Continental GT': [45000000, 55000000],
    'Bentley Flying Spur': [55000000, 65000000],
    'Bentley Bentayga': [45000000, 55000000],
    'Rolls Royce Phantom': [90000000, 100000000],
    'Rolls Royce Ghost': [70000000, 80000000],
    'Rolls Royce Cullinan': [70000000, 80000000],
    'Rolls Royce Wraith': [65000000, 75000000],
    'Rolls Royce Dawn': [75000000, 85000000],
    'Rolls Royce Spectre': [90000000, 100000000]
}

def generate_realistic_dataset():
    """Generate realistic dataset with actual Indian showroom prices"""
    data = []
    current_year = datetime.now().year
    
    for car_model, price_range in real_car_prices.items():
        # Extract company from car model
        company = car_model.split()[0]
        if company == 'Land' and 'Rover' in car_model:
            company = 'Land Rover'
        
        # Generate multiple entries for each model with different years and conditions
        num_entries = random.randint(8, 15)
        
        for _ in range(num_entries):
            # Generate year
            year = random.randint(2010, current_year)
            
            # Base price from real showroom range (no depreciation)
            base_price = random.uniform(price_range[0], price_range[1])
            
            # Only add small market variation (not depreciation)
            market_variation = random.uniform(0.95, 1.05)
            current_price = base_price * market_variation
            
            # Generate realistic kilometers driven based on age
            age = current_year - year
            if age == 0:
                kms_driven = random.randint(0, 5000)
            else:
                kms_driven = random.randint(age * 8000, age * 20000)
            
            # Determine fuel type based on model and year
            if 'EV' in car_model or 'Electric' in car_model:
                fuel_type = 'Electric'
            elif 'Diesel' in car_model:
                fuel_type = 'Diesel'
            elif year < 2015:
                fuel_type = np.random.choice(['Petrol', 'Diesel'], p=[0.6, 0.4])
            elif company in ['Maruti Suzuki', 'Hyundai', 'Kia', 'Tata Motors']:
                fuel_type = np.random.choice(['Petrol', 'Diesel', 'CNG', 'Electric'], p=[0.5, 0.3, 0.1, 0.1])
            elif company in ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche']:
                fuel_type = np.random.choice(['Petrol', 'Diesel', 'Electric'], p=[0.6, 0.3, 0.1])
            else:
                fuel_type = np.random.choice(['Petrol', 'Diesel'], p=[0.7, 0.3])
            
            # Keep showroom prices - no fuel type adjustments for original pricing
            
            # Ensure price stays within showroom range
            current_price = max(price_range[0] * 0.9, min(current_price, price_range[1] * 1.1))
            
            data.append({
                'name': car_model,
                'company': company,
                'year': year,
                'kms_driven': kms_driven,
                'fuel_type': fuel_type,
                'Price': int(current_price)
            })
    
    return pd.DataFrame(data)

# Generate the realistic dataset
df = generate_realistic_dataset()

# Shuffle the dataset
df = df.sample(frac=1).reset_index(drop=True)

# Save to CSV
df.to_csv('Cleaned_Car_data.csv', index=False)

print(f"Generated realistic dataset with {len(df)} cars")
print(f"Price range: {df['Price'].min():,} - {df['Price'].max():,}")
print(f"Companies: {df['company'].nunique()}")
print(f"Models: {df['name'].nunique()}")
print(f"Fuel types: {df['fuel_type'].unique()}")
print(f"Year range: {df['year'].min()} - {df['year'].max()}")

# Display sample data
print("\nSample realistic data:")
print(df.head(15))

# Show price distribution
print(f"\nPrice distribution:")
print(f"Under 10 lakh: {len(df[df['Price'] < 1000000])} cars")
print(f"10-20 lakh: {len(df[(df['Price'] >= 1000000) & (df['Price'] < 2000000)])} cars")
print(f"20-50 lakh: {len(df[(df['Price'] >= 2000000) & (df['Price'] < 5000000)])} cars")
print(f"50 lakh - 1 crore: {len(df[(df['Price'] >= 5000000) & (df['Price'] < 10000000)])} cars")
print(f"1-5 crore: {len(df[(df['Price'] >= 10000000) & (df['Price'] < 50000000)])} cars")
print(f"Above 5 crore: {len(df[df['Price'] >= 50000000])} cars")
