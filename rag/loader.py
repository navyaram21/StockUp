import pandas as pd
def load_bank_statement(filepath: str) -> list:
    df=pd.read_csv(filepath)
    transactions=[]
    for _, row in df.iterrows():
     line = f"On {row['date']}, {row['description']} of {row['amount']} ({row['category']}, {row['type']})"
     transactions.append(line)
    return transactions
if __name__ == "__main__":
    results = load_bank_statement("data/bank_statement.csv")
    for line in results:
        print(line)
