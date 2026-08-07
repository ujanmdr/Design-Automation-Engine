import json
import os

ocr_data = """
1 201810001 Sujen Maharjan September 28
2 201810002 Mukesh Maharjan 1-Oct-2018 September 2
3 201810003 Madhav Pandey 1-Oct-2018 September 22
4 201810004 Rojina Maharjan 1-Oct-2018 June 15
5 201810005 Monika Joshi (Subba) 1-Oct-2018 July 12
6 201810006 Success Maharjan 22-Oct-2018 February 25
9 201909011 Tansha Maharjan 15-Sep-2019
10 202012019 Sumedh Bajracharya 14-Dec-2020 February 18
11 202101021 Salina Maharjan 11-Jan-2021 September 4
12 202102023 Ashutosh Dhoj Joshi 8-Feb-2021 March 7
13 202104024 Dipesh Raj Shakya 5-Apr-2021 September 12
14 202104025 Binish Maharjan 5-Apr-2021 August 29
15 202105028 Amrita Thakur 10-May-2021 November 30
16 202108031 Sonika Maharjan 17-Aug-2021 December 27
17 202205033 Aditya Malla 16-May-2022 February 14
18 202205034 Alisha Dhukuchhu 16-May-2022 May 28
19 202205035 Abyakta Koirala 16-May-2022 February 26
20 202205036 Gagan Bhattarai 16-May-2022 July 9
21 202205039 Puja Siemak 16-May-2022 October 24
22 202205040 Krisha Maharjan 16-May-2022 January 26
23 202206042 Shanti Deula 16-Jun-2022 June 12
24 202208043 Kamana Karki 23-Aug-2022 December 13
25 202301045 Krishna Bhandari 16-Jan-2023 February 24
26 202302046 Sangita Maharjan 13-Feb-2023 September 04
27 202305047 Rabi Maharjan 02-May-2023 Jan 23
28 202305048 Suvha Shrestha 02-May-2023 July 17
29 202307050 Roshan Subedi 03-July-2023 July 24
30 202307051 Ashmin Bhattarai 03-July-2023 December 24
31 202307052 Samir Thapa 16-May-2023 October 28
32 202308055 Raju Deula 14-Aug-2023 16 Asar
33 202311056 Apekshya Shakya 08-Nov-2023 February 21
34 202311058 Ujan Manandhar 17-Nov-2023 March 25
35 202401059 Abiral Khadka 15-Jan-2024 December 2
36 202401060 Mahesh Karki 22-Jan-2024 January 2
37 202403062 Kushal Pangeni 06-Mar-2024 April 8
38 202404063 Sony Tuladhar 15-Apr-2024 March 05
39 202404064 Sunira Maharjan 15-Apr-2024 Apr 17
40 202404065 Aashish Chapain 15-Apr-2024 Apr 17
41 202406067 Dilli Maya Kattel 20-June-2024 05 Jestha
42 202407068 Prashjeev Rai 22-July-2024 Dec 07
43 202407069 Saurav Khanal 22-July-2024 Feb 09
44 202407071 Saljesh Maharjan 29-July-2024 May 18
45 202410072 Sajag Ratna Shakya 22-Oct-2024 January 21
46 202411073 Ronish Shrestha 11-Nov-2024 December 29
47 202504074 Meenu Tamang 29-Apr-2025 March 20
48 202508075 Yakina Maharjan 18 Aug 2025 June 15
"""

# Manual mappings for names that don't match exactly
name_mappings = {
    "Monika Joshi (Subba)": "Monica Subba",
    "Ashutosh Dhoj Joshi": "Ashutosh Joshi",
    "Dipesh Raj Shakya": "Dipesh Shakya",
    "Puja Siemak": "Puja Shrestha",
    "Saljesh Maharjan": "Salijesh Maharjan",
    "Sajag Ratna Shakya": "Sajag Shakya"
}

# Helper to convert dates to MM-DD
months = {
    "january": "01", "february": "02", "march": "03", "april": "04", "may": "05", "june": "06",
    "july": "07", "august": "08", "september": "09", "october": "10", "november": "11", "december": "12",
    "jan": "01", "feb": "02", "apr": "04", "dec": "12"
}

def parse_dob(dob_str):
    if not dob_str:
        return "01-01" # fallback
    
    dob_str = dob_str.lower().strip()
    
    # Custom nepali calendar dates
    if "16 asar" in dob_str:
        return "06-30" # Asar 16 is approx June 30
    if "05 jestha" in dob_str:
        return "05-19" # Jestha 5 is approx May 19
        
    parts = dob_str.split()
    if len(parts) == 2:
        # e.g., "September 28" or "June 15" or "September 2"
        month_name = parts[0]
        day_str = parts[1]
        
        # If order is "04 September" instead
        if month_name.isdigit():
            day_str = parts[0]
            month_name = parts[1]
            
        m = months.get(month_name, "01")
        d = f"{int(day_str):02d}"
        return f"{m}-{d}"
    elif len(parts) == 1:
        # check if it is "Jan 23" style but split space-free
        # e.g. "December 2" is parts ["December", "2"] but if parsed wrong
        pass
    return "01-01"

# Load employees.json
json_path = "src/data/employees.json"
with open(json_path, "r", encoding="utf-8") as f:
    employees = json.load(f)

# Parse OCR lines
parsed_records = []
for line in ocr_data.strip().split("\n"):
    parts = line.strip().split()
    if len(parts) < 3:
        continue
    sn = parts[0]
    id_no = parts[1]
    
    # Find where date is. D.O.B is always at the end, or appointment date is before it.
    # Let's extract the name and dates carefully.
    # Example format:
    # 2 201810002 Mukesh Maharjan 1-Oct-2018 September 2
    # 1 201810001 Sujen Maharjan September 28
    
    # We can join the remaining parts and detect fields
    remaining = " ".join(parts[2:])
    
    # Find appointment date if any (contains dash like -Oct- or -Dec- or -July- or spaces like Aug 2025)
    # Check for formats: "1-Oct-2018", "18 Aug 2025", "15-Sep-2019" etc.
    appointment_date = ""
    dob = ""
    
    import re
    app_date_match = re.search(r'(\d+-(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|June|July|Sept|Dec)-\d+|\d+\s+(?:Aug)\s+\d+)', remaining, re.IGNORECASE)
    if app_date_match:
        appointment_date = app_date_match.group(1)
        name_part = remaining[:app_date_match.start()].strip()
        dob_part = remaining[app_date_match.end():].strip()
    else:
        # No appointment date (e.g. Sujen Maharjan September 28)
        # Birthday might be at the end.
        # Let's find month names
        month_names = list(months.keys()) + ["september", "january", "february", "march", "april", "may", "june", "july", "august", "october", "november", "december"]
        found_month = None
        for m_name in month_names:
            m_idx = remaining.lower().find(m_name)
            if m_idx != -1:
                found_month = m_name
                name_part = remaining[:m_idx].strip()
                dob_part = remaining[m_idx:].strip()
                break
        if not found_month:
            name_part = remaining
            dob_part = ""
            
    # Resolve mapped names
    resolved_name = name_mappings.get(name_part, name_part)
    
    parsed_records.append({
        "original_name": name_part,
        "resolved_name": resolved_name,
        "appointment_date": appointment_date,
        "dob": parse_dob(dob_part)
    })

# Update json records
updated_count = 0
for record in parsed_records:
    # Match by name
    match = None
    for emp in employees:
        if emp["name"].lower() == record["resolved_name"].lower():
            match = emp
            break
            
    if match:
        match["birthday"] = record["dob"]
        if record["appointment_date"]:
            match["appointmentDate"] = record["appointment_date"]
        updated_count += 1
    else:
        # Create a new record and append
        new_emp = {
            "id": record["resolved_name"].lower().replace(" ", "-"),
            "name": record["resolved_name"],
            "title": "Team Member",
            "birthday": record["dob"],
            "photoFileName": f"{record['resolved_name']}.png",
            "birthdayPhotoSettings": {
                "x": 160,
                "y": 568,
                "scale": 1.15
            },
            "idCardPhotoSettings": {
                "x": 0,
                "y": 0,
                "scale": 1
            },
            "email": f"{record['resolved_name'].lower().replace(' ', '.')}@gritfeat.com"
        }
        if record["appointment_date"]:
            new_emp["appointmentDate"] = record["appointment_date"]
        employees.append(new_emp)
        print(f"Created new JSON record for name: '{record['resolved_name']}'")
        updated_count += 1

# Save employees.json
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(employees, f, indent=2, ensure_ascii=False)

print(f"Successfully updated {updated_count} employee records in employees.json!")
