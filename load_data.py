import requests

# Load product and service
# url = "http://localhost:3000/api/trpc/product.createProduct"
# data = [
#   { "name": "Digital Marketing Consultation", "description": "Expert guidance on SEO, PPC, and content strategy.", "type": "SERVICE" },
#   { "name": "Smartphone Stand", "description": "Adjustable and portable stand for mobile devices.", "type": "PRODUCT" },
#   { "name": "Personal Fitness Training", "description": "One-on-one coaching for weight loss and muscle building.", "type": "SERVICE" },
#   { "name": "Organic Coffee Beans", "description": "Premium Arabica coffee beans sourced from Colombia.", "type": "PRODUCT" },
#   { "name": "Home Cleaning Service", "description": "Professional deep cleaning for homes and apartments.", "type": "SERVICE" },
#   { "name": "Mechanical Keyboard", "description": "RGB backlit keyboard with tactile switches.", "type": "PRODUCT" },
#   { "name": "Freelance Web Development", "description": "Custom website development using modern technologies.", "type": "SERVICE" },
#   { "name": "Portable Power Bank", "description": "10,000mAh power bank with fast charging support.", "type": "PRODUCT" },
#   { "name": "Tax Filing Assistance", "description": "Certified accountants helping with tax filing and refunds.", "type": "SERVICE" },
#   { "name": "Noise-Canceling Headphones", "description": "Over-ear headphones with immersive sound quality.", "type": "PRODUCT" },
#   { "name": "Virtual Assistant Service", "description": "Remote administrative and scheduling support.", "type": "SERVICE" },
#   { "name": "Smart LED Bulbs", "description": "Wi-Fi enabled color-changing light bulbs.", "type": "PRODUCT" },
#   { "name": "Legal Consultation", "description": "Professional legal advice for contracts and disputes.", "type": "SERVICE" },
#   { "name": "Ergonomic Office Chair", "description": "Adjustable office chair with lumbar support.", "type": "PRODUCT" },
#   { "name": "Photography Session", "description": "Professional portrait and event photography service.", "type": "SERVICE" },
#   { "name": "Electric Toothbrush", "description": "Rechargeable toothbrush with multiple cleaning modes.", "type": "PRODUCT" },
#   { "name": "Language Tutoring", "description": "Personalized lessons for learning Spanish and French.", "type": "SERVICE" },
#   { "name": "Wireless Charging Pad", "description": "Fast charging pad compatible with multiple devices.", "type": "PRODUCT" },
#   { "name": "Resume Writing Service", "description": "Custom resume creation for job seekers.", "type": "SERVICE" }
# ]
# for i in data:
#   new_data = i
#   response = requests.post(url=url, json=new_data, headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4OWE1MzFkYi1mNDlkLTRmNTAtODU5Mi01OTBjYjUxNmQyYTYiLCJpYXQiOjE3NDIxNDE5MTUsImV4cCI6MTc0Mjc0NjcxNX0.SEKrfuUUgWqnF6mIvZPzZ15bK-MlnztJ4i-XL6iFJhg"})
#   print(str(response.status_code) + " " + str(new_data))

# Load users
# url = "http://localhost:3000/api/trpc/auth.signup"
# data = [
#   { "name": "Ava Mitchell", "email": "ava.mitchell@example.com", "password": "qwerty123" },
#   { "name": "Liam Parker", "email": "liam.parker@example.com", "password": "securepass" },
#   { "name": "Sophia Hayes", "email": "sophia.hayes@example.com", "password": "pass7890" },
#   { "name": "Noah Bennett", "email": "noah.bennett@example.com", "password": "hello1234" },
#   { "name": "Olivia Reed", "email": "olivia.reed@example.com", "password": "strongpass" },
#   { "name": "Ethan Carter", "email": "ethan.carter@example.com", "password": "mypassword" },
#   { "name": "Emma Brooks", "email": "emma.brooks@example.com", "password": "randompass" },
#   { "name": "Mason Foster", "email": "mason.foster@example.com", "password": "abcdef12" },
#   { "name": "Isabella Gray", "email": "isabella.gray@example.com", "password": "letmein123" },
#   { "name": "Lucas Turner", "email": "lucas.turner@example.com", "password": "hunter789" },
#   { "name": "Mia Richardson", "email": "mia.richardson@example.com", "password": "password77" },
#   { "name": "James Cooper", "email": "james.cooper@example.com", "password": "adminpass1" },
#   { "name": "Amelia Ward", "email": "amelia.ward@example.com", "password": "welcome88" },
#   { "name": "Benjamin Scott", "email": "benjamin.scott@example.com", "password": "chocolate7" },
#   { "name": "Charlotte Hughes", "email": "charlotte.hughes@example.com", "password": "sunshine99" },
#   { "name": "Henry Murphy", "email": "henry.murphy@example.com", "password": "dragon456" },
#   { "name": "Ella Wright", "email": "ella.wright@example.com", "password": "testpass12" },
#   { "name": "Alexander Ross", "email": "alexander.ross@example.com", "password": "oceanblue1" },
#   { "name": "Harper Adams", "email": "harper.adams@example.com", "password": "yellowmoon" },
#   { "name": "William Nelson", "email": "william.nelson@example.com", "password": "superpass99" }
# ]
# for new_data in data:
#   response = requests.post(url=url, json=new_data)
#   print(str(response.status_code) + " " + str(new_data))

# Generate User JWT
# url = "http://localhost:3000/api/trpc/auth.signin"
# tokens = []
# data = [
#   { "email": "isabella.gray@example.com", "password": "letmein123" },
#   { "email": "lucas.turner@example.com", "password": "hunter789" },
#   { "email": "mia.richardson@example.com", "password": "password77" },
#   { "email": "james.cooper@example.com", "password": "adminpass1" },
#   { "email": "amelia.ward@example.com", "password": "welcome88" },
# ]
# for new_data in data:
#   response = requests.post(url=url, json=new_data)
#   token = str(response.json()['result']['data']['token'])
#   tokens.append(token)
#   print(str(response.status_code) + " " + token)
# print()
# print(tokens)

url = "http://localhost:3000/api/trpc/brand.createBrand"
user_tokens = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZDg4OTFjMy1mNzMzLTRjNDQtODg4MS05NDE0ODZlODAxM2QiLCJpYXQiOjE3NDIzOTUzNjQsImV4cCI6MTc0MzAwMDE2NH0.yofspHcPXlDv7XAmPkF6_0tfPlT4YcASavaheeNmJGw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MDgzMGExNS01Nzc1LTQxOGYtODFiMi02MmM4Y2I4YmQ3ZTUiLCJpYXQiOjE3NDIzOTUzNjQsImV4cCI6MTc0MzAwMDE2NH0.KVZ3ielXaBfEJSJ9ch99Phdf19en7OahCkv0W4eGTDI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5MGNiNzQ1ZC0yOGIxLTRjMDMtYjFiYy00OWU5MTdlNWY3MjQiLCJpYXQiOjE3NDIzOTUzNjQsImV4cCI6MTc0MzAwMDE2NH0.981iS9fp0MZ8uRDQgL2cREL73O9rxeuH93w8CUx9fMI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2E2NzhjYi02YmIyLTQ5ZWEtODVkMC04YmVlOGRkNzZiZjQiLCJpYXQiOjE3NDIzOTUzNjUsImV4cCI6MTc0MzAwMDE2NX0.R94YMTYn554t2g9wkHBhvaHGxSmoFUR6S6kT0etOC8c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMThkMzFjMC1iNjg1LTQ3YTUtYTgxOC0zZGJlYTJmOTdlMWIiLCJpYXQiOjE3NDIzOTUzNjUsImV4cCI6MTc0MzAwMDE2NX0.4hywbY0a_2vzpxY2wWn_14cd9KEKy5L_BAxlRFOS44U']
brands = [
  { "name": "Everest Gear" },
  { "name": "Lumos Tech" },
  { "name": "Verdant Organics" },
  { "name": "Nimbus Apparel" },
  { "name": "Astra Motors" }
]

for i in range(len(brands)):
  response = requests.post(url=url, json=brands[i], headers={"Authorization": f"Bearer {user_tokens[i]}"})
  print(str(response.status_code) + " " + str(brands[i]))
