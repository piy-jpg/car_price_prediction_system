import pandas as pd

# Read the CSV dataset
df = pd.read_csv('Cleaned_Car_data.csv')

# Convert to Excel
excel_filename = 'Car_Price_Dataset.xlsx'
df.to_excel(excel_filename, index=False, engine='openpyxl')

print(f"Dataset converted to Excel: {excel_filename}")
print(f"Total cars: {len(df)}")
print(f"Columns: {list(df.columns)}")
print(f"Price range: {df['Price'].min():,} - {df['Price'].max():,}")
print(f"Companies: {df['company'].nunique()}")
print(f"Models: {df['name'].nunique()}")

# Display first few rows
print("\nSample data:")
print(df.head())
