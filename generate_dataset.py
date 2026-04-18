import pandas as pd
import numpy as np
from datetime import datetime
import random

# Define car companies and their models
car_data = {
    'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Ertiga', 'XL6', 'Ignis', 'S-Cross', 'Ciaz', 'Alto', 'WagonR', 'Celerio'],
    'Hyundai': ['i20', 'i10', 'Venue', 'Creta', 'Verna', 'Eon', 'Grand i10', 'Aura', 'Tucson', 'Elantra', 'Kona'],
    'Honda': ['City', 'Amaze', 'WR-V', 'Jazz', 'CR-V', 'Civic', 'BR-V'],
    'Toyota': ['Innova', 'Fortuner', 'Yaris', 'Etios', 'Glanza', 'Camry', 'Corolla', 'Land Cruiser'],
    'Tata': ['Nexon', 'Tiago', 'Altroz', 'Tigor', 'Harrier', 'Safari', 'Punch', 'Nexon EV'],
    'Mahindra': ['Thar', 'Scorpio', 'XUV500', 'XUV300', 'Bolero', 'Marazzo', 'KUV100', 'XUV700'],
    'Ford': ['EcoSport', 'Figo', 'Aspire', 'Endeavour', 'Mustang'],
    'Volkswagen': ['Polo', 'Vento', 'Ameo', 'Tiguan', 'Passat'],
    'Skoda': ['Rapid', 'Octavia', 'Superb', 'Kodiaq', 'Kushaq'],
    'Renault': ['Kwid', 'Triber', 'Duster', 'Kiger'],
    'Nissan': ['Magnite', 'Kicks', 'Sunny', 'Micra'],
    'MG': ['Hector', 'Astor', 'ZS EV', 'Gloster'],
    'Kia': ['Seltos', 'Sonet', 'Carnival', 'Carens'],
    'Jeep': ['Compass', 'Wrangler', 'Meridian'],
    'BMW': ['X1', 'X3', 'X5', '3 Series', '5 Series', '7 Series'],
    'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC', 'GLE'],
    'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
    'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90']
}

# Price ranges by company (in INR)
price_ranges = {
    'Maruti Suzuki': (200000, 1200000),
    'Hyundai': (300000, 2500000),
    'Honda': (500000, 4000000),
    'Toyota': (700000, 5000000),
    'Tata': (400000, 2500000),
    'Mahindra': (600000, 3000000),
    'Ford': (500000, 2500000),
    'Volkswagen': (600000, 3500000),
    'Skoda': (800000, 4000000),
    'Renault': (400000, 1500000),
    'Nissan': (500000, 2000000),
    'MG': (1000000, 4000000),
    'Kia': (800000, 3000000),
    'Jeep': (1500000, 6000000),
    'BMW': (3000000, 15000000),
    'Mercedes-Benz': (3500000, 20000000),
    'Audi': (3000000, 15000000),
    'Volvo': (4000000, 12000000)
}

# Generate dataset
data = []
current_year = datetime.now().year

for company, models in car_data.items():
    num_cars = random.randint(40, 80)  # Generate 40-80 cars per company
    
    for _ in range(num_cars):
        model = random.choice(models)
        year = random.randint(2010, current_year)
        kms_driven = random.randint(5000, 150000)
        fuel_type = random.choice(['Petrol', 'Diesel', 'CNG', 'Electric'])
        
        # Base price depends on company, model, year, and fuel type
        min_price, max_price = price_ranges[company]
        
        # Adjust price based on year (newer cars cost more)
        year_factor = 1 + (year - 2010) * 0.1
        base_price = random.uniform(min_price, max_price) * year_factor
        
        # Adjust price based on kilometers driven
        km_factor = 1 - (kms_driven / 200000) * 0.3  # Max 30% reduction
        final_price = base_price * km_factor
        
        # Adjust price based on fuel type
        if fuel_type == 'Diesel':
            final_price *= 1.1
        elif fuel_type == 'Electric':
            final_price *= 1.3
        elif fuel_type == 'CNG':
            final_price *= 0.95
        
        # Add some random variation
        final_price *= random.uniform(0.9, 1.1)
        
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
df = pd.DataFrame(data)

# Shuffle the dataset
df = df.sample(frac=1).reset_index(drop=True)

# Save to CSV
df.to_csv('Cleaned_Car_data.csv', index=False)

print(f"Generated dataset with {len(df)} cars")
print(f"Price range: {df['Price'].min():,} - {df['Price'].max():,}")
print(f"Companies: {df['company'].nunique()}")
print(f"Models: {df['name'].nunique()}")
print(f"Fuel types: {df['fuel_type'].unique()}")
print(f"Year range: {df['year'].min()} - {df['year'].max()}")

# Display sample data
print("\nSample data:")
print(df.head(10))
