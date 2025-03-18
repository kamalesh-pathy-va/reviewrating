import requests
import json

url = "http://localhost:3000/api/trpc/product.createProduct"

data = [
  { "name": "Digital Marketing Consultation", "description": "Expert guidance on SEO, PPC, and content strategy.", "type": "SERVICE" },
  { "name": "Smartphone Stand", "description": "Adjustable and portable stand for mobile devices.", "type": "PRODUCT" },
  { "name": "Personal Fitness Training", "description": "One-on-one coaching for weight loss and muscle building.", "type": "SERVICE" },
  { "name": "Organic Coffee Beans", "description": "Premium Arabica coffee beans sourced from Colombia.", "type": "PRODUCT" },
  { "name": "Home Cleaning Service", "description": "Professional deep cleaning for homes and apartments.", "type": "SERVICE" },
  { "name": "Mechanical Keyboard", "description": "RGB backlit keyboard with tactile switches.", "type": "PRODUCT" },
  { "name": "Freelance Web Development", "description": "Custom website development using modern technologies.", "type": "SERVICE" },
  { "name": "Portable Power Bank", "description": "10,000mAh power bank with fast charging support.", "type": "PRODUCT" },
  { "name": "Tax Filing Assistance", "description": "Certified accountants helping with tax filing and refunds.", "type": "SERVICE" },
  { "name": "Noise-Canceling Headphones", "description": "Over-ear headphones with immersive sound quality.", "type": "PRODUCT" },
  { "name": "Virtual Assistant Service", "description": "Remote administrative and scheduling support.", "type": "SERVICE" },
  { "name": "Smart LED Bulbs", "description": "Wi-Fi enabled color-changing light bulbs.", "type": "PRODUCT" },
  { "name": "Legal Consultation", "description": "Professional legal advice for contracts and disputes.", "type": "SERVICE" },
  { "name": "Ergonomic Office Chair", "description": "Adjustable office chair with lumbar support.", "type": "PRODUCT" },
  { "name": "Photography Session", "description": "Professional portrait and event photography service.", "type": "SERVICE" },
  { "name": "Electric Toothbrush", "description": "Rechargeable toothbrush with multiple cleaning modes.", "type": "PRODUCT" },
  { "name": "Language Tutoring", "description": "Personalized lessons for learning Spanish and French.", "type": "SERVICE" },
  { "name": "Wireless Charging Pad", "description": "Fast charging pad compatible with multiple devices.", "type": "PRODUCT" },
  { "name": "Resume Writing Service", "description": "Custom resume creation for job seekers.", "type": "SERVICE" }
]


for i in data:
  new_data = i
  response = requests.post(url=url, json=new_data, headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4OWE1MzFkYi1mNDlkLTRmNTAtODU5Mi01OTBjYjUxNmQyYTYiLCJpYXQiOjE3NDIxNDE5MTUsImV4cCI6MTc0Mjc0NjcxNX0.SEKrfuUUgWqnF6mIvZPzZ15bK-MlnztJ4i-XL6iFJhg"})
  print(str(response.status_code) + " " + str(new_data))