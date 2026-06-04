import pdfplumber
import pandas as pd
import os

pdf_path = r"C:\Users\Admin\Downloads\TGEAPCET_2025_LASTRANKS_FirstPhase (2) (1).pdf"
output_path = r"d:\eamcet college predictor\tgeapcet_2025_fixed.csv"

def extract_eamcet_data():
    all_data = []
    print(f"Opening PDF: {pdf_path}")
    
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            print(f"Processing Page {i+1}/{len(pdf.pages)}...")
            table = page.extract_table()
            
            if table:
                # Clean rows: remove header rows repeating on every page
                for row in table:
                    # Skip empty rows
                    if not row or not any(row):
                        continue
                        
                    # Filter out rows that are just headers
                    if not row[0] or "Inst" in str(row[0]) or "Code" in str(row[0]) or "Institute Name" in str(row):
                        continue
                    
                    # Ensure the row has enough columns (we expect around 31)
                    if len(row) >= 30:
                        # Clean cell values: remove newlines and leading/trailing whitespace
                        cleaned_row = [str(cell).replace('\n', ' ').strip() if cell is not None else '' for cell in row]
                        all_data.append(cleaned_row)

    if not all_data:
        print("❌ No data rows extracted!")
        return

    # Define columns
    columns = [
        'institute code', 'institute_name', 'place', 'district_code', 
        'co_education', 'college_type', 'branch_code', 'branch_name',
        'OC_BOYS', 'OC_GIRLS', 'BC_A_BOYS', 'BC_A_GIRLS', 'BC_B_BOYS', 'BC_B_GIRLS',
        'BC_C_BOYS', 'BC_C_GIRLS', 'BC_D_BOYS', 'BC_D_GIRLS', 'BC_E_BOYS', 'BC_E_GIRLS',
        'SC_I_BOYS', 'SC_I_GIRLS', 'SC_II_BOYS', 'SC_II_GIRLS', 'SC_III_BOYS', 'SC_III_GIRLS',
        'ST_BOYS', 'ST_GIRLS', 'EWS_BOYS', 'EWS_GIRLS', 'affiliated_to'
    ]

    # Convert to DataFrame
    # Sometimes extract_table gives extra columns, we trim or pad
    df = pd.DataFrame(all_data)
    
    # Trim to expected column count if necessary
    if len(df.columns) > len(columns):
        df = df.iloc[:, :len(columns)]
    
    df.columns = columns[:len(df.columns)]
    
    # Save to CSV
    df.to_csv(output_path, index=False)
    print(f"Success! Clean data saved to: {output_path}")
    print(f"Total rows extracted: {len(df)}")

if __name__ == "__main__":
    extract_eamcet_data()
