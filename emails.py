import csv
from pathlib import Path


def get_emails(csv_path: Path) -> list[str]:
	with csv_path.open(newline="", encoding="utf-8") as csv_file:
		rows = csv.reader(csv_file)

		for row in rows:
			if len(row) > 4 and row[4] == "Campus Email":
				break
		else:
			raise ValueError("CSV header with 'Campus Email' column was not found")

		return [
			row[4].strip()
			for row in rows
			if len(row) > 4 and row[4].strip() not in {"", "(Hidden)"}
		]


if __name__ == "__main__":
	csv_file = Path(__file__).with_name("OrganizationRoster.csv")
	print(",".join(get_emails(csv_file)))
