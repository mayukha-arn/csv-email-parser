# CSV Email Parser

This script reads a CSV file, finds the column labeled `Campus Email`, and prints a comma-separated list of all non-empty email addresses.

## How it works

- The script opens the CSV file located at `OrganizationRoster.csv` in the same folder as `emails.py`.
- It reads the rows using Python's `csv` module.
- It looks for the header row and finds the column whose value is `Campus Email`.
- It then collects each value from that column, skips blank entries and `(Hidden)`, and prints them as a single comma-separated string.

Example output:

```text
student1@example.edu,student2@example.edu,student3@example.edu
```

## Swap in your own CSV

To use a different roster file:

1. Replace `OrganizationRoster.csv` with your own CSV file in the project folder.
2. Keep the same column name `Campus Email` in the header row, or update the script if your column name is different.
3. Run the script:

```bash
python3 emails.py
```

If you want to use a different file name, update this line in `emails.py`:

```python
csv_file = Path(__file__).with_name("OrganizationRoster.csv")
```

Change it to the name of your CSV file, for example:

```python
csv_file = Path(__file__).with_name("my_roster.csv")
```

## Notes

- The script expects UTF-8 encoded CSV data.
- It ignores blank email cells and `(Hidden)` values.
- The output is formatted as a comma-separated list suitable for pasting into another system.
