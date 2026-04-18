import pandas as pd
import pickle
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

print("Loading and preparing data...")
# Load the data
df = pd.read_csv('Cleaned_Car_data.csv')

# Prepare features
X = df[['name', 'company', 'year', 'kms_driven', 'fuel_type']]
y = df['Price']

print(f"Dataset shape: {df.shape}")
print(f"Features: {X.columns.tolist()}")

# Encode categorical variables
le_name = LabelEncoder()
le_company = LabelEncoder()
le_fuel = LabelEncoder()

X_encoded = X.copy()
X_encoded['name'] = le_name.fit_transform(X['name'])
X_encoded['company'] = le_company.fit_transform(X['company'])
X_encoded['fuel_type'] = le_fuel.fit_transform(X['fuel_type'])

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, test_size=0.2, random_state=42)

# Train the model
print("Training the model...")
model = LinearRegression()
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Model Performance:")
print(f"Mean Squared Error: {mse:.2f}")
print(f"R² Score: {r2:.2f}")

# Save the model and encoders together
model_data = {
    'model': model,
    'le_name': le_name,
    'le_company': le_company,
    'le_fuel': le_fuel,
    'feature_columns': ['name', 'company', 'year', 'kms_driven', 'fuel_type']
}

with open('LinearRegressionModel.pkl', 'wb') as f:
    pickle.dump(model_data, f)

print("Model trained and saved successfully!")
print(f"Model saved as 'LinearRegressionModel.pkl'")
print(f"Training completed with {len(X_train)} samples")
