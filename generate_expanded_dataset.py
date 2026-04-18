import pandas as pd
import numpy as np
from datetime import datetime
import random

# Comprehensive Indian car dataset with sports cars
car_data = {
    # Indian Manufacturers
    'Maruti Suzuki': [
        'Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Ertiga', 'XL6', 'Ignis', 'S-Cross', 'Ciaz', 'Alto', 'WagonR', 'Celerio',
        'Jimny', 'Fronx', 'Grand Vitara', 'Invicto', 'Swift Sport', 'Baleno RS'
    ],
    'Tata Motors': [
        'Nexon', 'Tiago', 'Altroz', 'Tigor', 'Harrier', 'Safari', 'Punch', 'Nexon EV', 'Tiago EV', 'Punch EV',
        'Curvv', 'Sierra EV', 'Avinya', 'Harrier EV', 'Safari EV', 'Altroz Racer'
    ],
    'Mahindra': [
        'Thar', 'Scorpio', 'XUV500', 'XUV300', 'Bolero', 'Marazzo', 'KUV100', 'XUV700', 'Thar 5-Door',
        'Scorpio N', 'Bolero Neo', 'XUV400 EV', 'BE 5', 'BE 6', 'XUV 3XO'
    ],
    'Hyundai': [
        'i20', 'i10', 'Venue', 'Creta', 'Verna', 'Eon', 'Grand i10', 'Aura', 'Tucson', 'Elantra', 'Kona',
        'Creta N Line', 'i20 N Line', 'Venue N Line', 'IONIQ 5', 'Casper', 'Exter'
    ],
    'Kia': [
        'Seltos', 'Sonet', 'Carnival', 'Carens', 'EV6', 'EV9', 'Seltos X-Line', 'Sonet X-Line'
    ],
    'Honda': [
        'City', 'Amaze', 'WR-V', 'Jazz', 'CR-V', 'Civic', 'BR-V', 'City e:HEV', 'New City'
    ],
    'Toyota': [
        'Innova', 'Fortuner', 'Yaris', 'Etios', 'Glanza', 'Camry', 'Corolla', 'Land Cruiser', 'Innova Hycross',
        'Fortuner Legender', 'Urban Cruiser Hyryder', 'Vellfire', 'Lexus ES', 'Lexus LX', 'GR Supra', 'GR 86'
    ],
    'Ford': [
        'EcoSport', 'Figo', 'Aspire', 'Endeavour', 'Mustang', 'Mustang Mach-E'
    ],
    'Volkswagen': [
        'Polo', 'Vento', 'Ameo', 'Tiguan', 'Passat', 'Taigun', 'Virtus', 'ID.4', 'Golf GTI'
    ],
    'Skoda': [
        'Rapid', 'Octavia', 'Superb', 'Kodiaq', 'Kushaq', 'Slavia', 'Enyaq iV', 'Octavia RS'
    ],
    'Renault': [
        'Kwid', 'Triber', 'Duster', 'Kiger', 'Kwid EV'
    ],
    'Nissan': [
        'Magnite', 'Kicks', 'Sunny', 'Micra', 'Leaf', 'GT-R'
    ],
    'MG': [
        'Hector', 'Astor', 'ZS EV', 'Gloster', 'MG 4 EV', 'MG 5 EV', 'Cyberster'
    ],
    'Jeep': [
        'Compass', 'Wrangler', 'Meridian', 'Grand Cherokee', 'Gladiator', 'Rubicon'
    ],
    'Citroen': [
        'C5 Aircross', 'C3', 'eC3', 'C3 Aircross'
    ],
    
    # Luxury Brands
    'BMW': [
        'X1', 'X3', 'X5', 'X6', 'X7', 'M2', 'M3', 'M4', 'M5', 'M8', '3 Series', '5 Series', '7 Series',
        'Z4', '8 Series', 'i4', 'iX', 'i7', 'XM', '2 Series Gran Coupe', '4 Series Gran Coupe', '6 Series GT'
    ],
    'Mercedes-Benz': [
        'A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'SLK', 'SL',
        'AMG A35', 'AMG A45', 'AMG C43', 'AMG C63', 'AMG E53', 'AMG E63', 'AMG GT', 'AMG GTR', 'EQS', 'EQE', 'EQC'
    ],
    'Audi': [
        'A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RSQ8',
        'e-tron', 'e-tron GT', 'Q4 e-tron', 'Q6 e-tron', 'S3', 'S4', 'S6', 'S8', 'SQ5', 'SQ7', 'SQ8'
    ],
    'Volvo': [
        'XC40', 'XC60', 'XC90', 'S60', 'S90', 'V40', 'V60', 'V90', 'C40', 'EX30', 'EX90', 'Polestar 2'
    ],
    'Jaguar': [
        'XE', 'XF', 'XJ', 'F-Type', 'F-Pace', 'E-Pace', 'I-Pace', 'XE SV Project 8', 'F-Type R'
    ],
    'Land Rover': [
        'Defender', 'Discovery', 'Discovery Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Range Rover'
    ],
    
    # Sports & Supercar Brands
    'Ferrari': [
        'Roma', 'Portofino', 'F8 Tributo', 'SF90 Stradale', '296 GTB', '812 Superfast', 'Monza SP1', 'Monza SP2'
    ],
    'Lamborghini': [
        'Huracan', 'Urus', 'Aventador', 'Revuelto', 'Temerario'
    ],
    'McLaren': [
        '570S', '720S', '765LT', 'GT', 'Artura', 'P1'
    ],
    'Porsche': [
        '911', '718 Cayman', '718 Boxster', 'Panamera', 'Macan', 'Cayenne', 'Taycan', '911 GT3', '911 Turbo S'
    ],
    'Aston Martin': [
        'DB11', 'Vantage', 'DBX', 'DBS Superleggera', 'Valhalla'
    ],
    'Bentley': [
        'Continental GT', 'Flying Spur', 'Bentayga', 'Mulliner Bacalar'
    ],
    'Rolls Royce': [
        'Phantom', 'Ghost', 'Cullinan', 'Wraith', 'Dawn', 'Spectre'
    ],
    
    # Other Premium Brands
    'Lexus': [
        'ES', 'LS', 'RX', 'NX', 'UX', 'LX', 'GX', 'IS', 'LC', 'RC', 'UX 300e', 'RZ 450e'
    ],
    'Genesis': [
        'G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60'
    ],
    'Maserati': [
        'Ghibli', 'Quattroporte', 'Levante', 'Grecale', 'MC20'
    ],
    'Lincoln': [
        'Navigator', 'Aviator', 'Corsair', 'Nautilus'
    ],
    'Cadillac': [
        'Escalade', 'XT4', 'XT5', 'XT6', 'CT4', 'CT5', 'Lyriq'
    ]
}

# Enhanced price ranges by company (in INR)
price_ranges = {
    # Budget Cars
    'Maruti Suzuki': (200000, 1500000),
    'Tata Motors': (300000, 2500000),
    'Mahindra': (600000, 3000000),
    'Renault': (400000, 1500000),
    'Nissan': (500000, 2000000),
    'Citroen': (800000, 2000000),
    
    # Mid-range
    'Hyundai': (400000, 3500000),
    'Kia': (700000, 3000000),
    'Honda': (600000, 4500000),
    'Ford': (500000, 3000000),
    'Volkswagen': (700000, 4000000),
    'Skoda': (900000, 4500000),
    'MG': (1000000, 5000000),
    
    # Premium
    'Toyota': (800000, 8000000),
    'Jeep': (1500000, 6000000),
    'Volvo': (4000000, 12000000),
    'Jaguar': (5000000, 20000000),
    'Land Rover': (6000000, 25000000),
    'Lexus': (4500000, 15000000),
    'Genesis': (4000000, 12000000),
    'Maserati': (12000000, 30000000),
    'Lincoln': (8000000, 15000000),
    'Cadillac': (7000000, 18000000),
    
    # Luxury
    'BMW': (4000000, 20000000),
    'Mercedes-Benz': (4500000, 25000000),
    'Audi': (4000000, 20000000),
    
    # Sports Cars & Supercars
    'Porsche': (15000000, 50000000),
    'Ferrari': (35000000, 80000000),
    'Lamborghini': (40000000, 90000000),
    'McLaren': (30000000, 70000000),
    'Aston Martin': (25000000, 60000000),
    'Bentley': (40000000, 80000000),
    'Rolls Royce': (60000000, 150000000)
}

# Generate additional 1500+ cars
data = []
current_year = datetime.now().year

for company, models in car_data.items():
    # Generate more cars for popular brands
    if company in ['Maruti Suzuki', 'Tata Motors', 'Hyundai', 'Kia', 'Mahindra']:
        num_cars = random.randint(80, 120)
    elif company in ['BMW', 'Mercedes-Benz', 'Audi', 'Toyota']:
        num_cars = random.randint(50, 80)
    elif company in ['Ferrari', 'Lamborghini', 'McLaren', 'Rolls Royce']:
        num_cars = random.randint(10, 25)  # Rare supercars
    else:
        num_cars = random.randint(30, 60)
    
    for _ in range(num_cars):
        model = random.choice(models)
        year = random.randint(2010, current_year)
        kms_driven = random.randint(5000, 200000)
        
        # Adjust fuel type distribution based on car category
        if company in ['Ferrari', 'Lamborghini', 'McLaren', 'Porsche']:
            fuel_type = random.choice(['Petrol', 'Petrol', 'Petrol', 'Electric'])  # Mostly petrol for supercars
        elif company in ['Tata Motors', 'MG', 'Hyundai']:
            fuel_type = random.choice(['Petrol', 'Diesel', 'Electric', 'CNG', 'Electric'])  # More EVs
        else:
            fuel_type = random.choice(['Petrol', 'Diesel', 'CNG', 'Electric'])
        
        # Base price depends on company, model, year, and fuel type
        min_price, max_price = price_ranges[company]
        
        # Adjust price based on year (newer cars cost more)
        year_factor = 1 + (year - 2010) * 0.12
        base_price = random.uniform(min_price, max_price) * year_factor
        
        # Adjust price based on kilometers driven
        km_factor = 1 - (kms_driven / 250000) * 0.4  # Max 40% reduction
        final_price = base_price * km_factor
        
        # Adjust price based on fuel type
        if fuel_type == 'Diesel':
            final_price *= 1.05
        elif fuel_type == 'Electric':
            final_price *= 1.2
        elif fuel_type == 'CNG':
            final_price *= 0.9
        
        # Special adjustments for sports cars
        if any(sports in model.lower() for sports in ['gt', 'rs', 'amg', 'm', 'sport', 'r8', 'turbo', 'gtr']):
            final_price *= 1.3
        elif any(supercar in company.lower() for supercar in ['ferrari', 'lamborghini', 'mclaren']):
            final_price *= 1.5
        
        # Add some random variation
        final_price *= random.uniform(0.85, 1.15)
        
        # Ensure price is within reasonable bounds
        final_price = max(min_price * 0.5, min(final_price, max_price * 1.5))
        
        data.append({
            'name': f"{company} {model}",
            'company': company,
            'year': year,
            'kms_driven': kms_driven,
            'fuel_type': fuel_type,
            'Price': int(final_price)
        })

# Create DataFrame
df_new = pd.DataFrame(data)

# Load existing dataset and combine
df_existing = pd.read_csv('Cleaned_Car_data.csv')
df_combined = pd.concat([df_existing, df_new], ignore_index=True)

# Shuffle the combined dataset
df_combined = df_combined.sample(frac=1).reset_index(drop=True)

# Save the expanded dataset
df_combined.to_csv('Cleaned_Car_data.csv', index=False)

print(f"Generated {len(df_new)} additional cars")
print(f"Total dataset now has {len(df_combined)} cars")
print(f"Price range: {df_combined['Price'].min():,} - {df_combined['Price'].max():,}")
print(f"Companies: {df_combined['company'].nunique()}")
print(f"Models: {df_combined['name'].nunique()}")
print(f"Fuel types: {df_combined['fuel_type'].unique()}")
print(f"Year range: {df_combined['year'].min()} - {df_combined['year'].max()}")

# Display sample data including sports cars
print("\nSample data including sports cars:")
print(df_combined.head(15))

# Display some supercar examples
supercars = df_combined[df_combined['Price'] > 20000000]
print(f"\nSupercars in dataset: {len(supercars)}")
if len(supercars) > 0:
    print("Sample supercars:")
    print(supercars[['name', 'year', 'Price']].head())
