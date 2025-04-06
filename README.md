# ReadME
# Product Price Alert Web App - FakeApi

A simple and lightweight web application that allows users to set price alerts on products from the [FakeStore API](https://fakestoreapi.com/). Users can track products and get notified when their desired price is matched.

# Tools / Dependencies:
- **Express.js**, 
- **EJS**, **LowDB**, 
- and **Vanilla JavaScript**, 
- with optional support for storing alerts locally via `localStorage`.

---

## 📸 Features

- Browse products by category
- Set price alerts per product
- View real-time price match status
- Light/Dark mode toggle
- Data persistence via **LowDB** or browser **localStorage**
- Run test with Jest | Supertest

---

## Technologies

| Layer        | Tech                                   |
| ------------ | -------------------------------------- |
| Backend      | [Express.js](https://expressjs.com/)   |
| Frontend     | [EJS](https://ejs.co/), HTML, CSS, JS  |
| API Source   | [FakeStoreAPI](https://fakestoreapi.com/) |
| Database     | [LowDB](https://github.com/typicode/lowdb) |
| Utilities    | [Axios](https://axios-http.com/)       |

---

## Getting Started

### Installation & set up

```bash
git clone https://github.com/Bablobeto/FakeApi.git fake-store
cd fake-store
npm install
npm run start:dev


## Endpoints
GET	/	Render homepage with products
GET	/api/fetch-category-product	Fetch products by category
POST	/api/set-price-alert	Save a product price alert
GET	/api/refresh-fake-store-api	Get evaluation of all alerts

## Test (TDD)
- npm test

## Screenshots
- Controller screenshot sample
![alt text](https://github.com/Bablobeto/FakeApi/blob/develop/screenshots/Controller_interaction.png)
<img width="1511" alt="Image" src="https://github.com/user-attachments/assets/c790a0fb-1f05-40ab-a524-3c9a94be103f" />

- Notification sidebar and theming screenshot sample
<img width="1511" alt="Image" src="https://github.com/user-attachments/assets/b349df41-2146-482d-876b-b920465cf245" />

- Product listing and category grouping screenshot sample
<img width="1511" alt="Image" src="https://github.com/user-attachments/assets/315d414e-c331-4332-94bf-c3ec4a223a76" />
![alt text](https://github.com/Bablobeto/FakeApi/blob/develop/screenshots/Product_listing_notification_alert.png)
