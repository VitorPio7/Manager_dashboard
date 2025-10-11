# Manager Dashboard API




## About the Project

Manager Dashboard API serves as the backend foundation for a management platform. Its main goal is to provide secure and well-structured endpoints to support a future front-end interface (planned with React + TypeScript). It’s designed to handle large amounts of product and user data with scalability and security in mind.

---

## ✨ Key Features

* Secure authentication using JWT (register and login).
* Full CRUD for users (create, read, update, delete).
* Scalable architecture ready to manage other resources (e.g., products, clients, projects).
* Clear route and controller structure to simplify front-end integration.
* Focus on scalability and best practices.

---

## 🛠️ Technologies

* Node.js
* Express.js
* (Planned/expected) MongoDB with Mongoose
* JSON Web Tokens (JWT)
* (Planned) TypeScript for future improvements

---

## 📂 Project Structure (overview)

```
Manager_dashboard/
├─ backend/
│  ├─ controllers/       # business logic for endpoints
│  ├─ models/            # Mongoose models (users, products, etc.)
│  ├─ routes/            # route definitions
│  ├─ middleware/        # authentication, validation, and error handling
│  ├─ utils/            # configuration files 
│  ├─ app.js   # main server entry point
│  └─ package.json
├─ .gitignore
└─ README.md
```


---

## ⚙️ Requirements

* Node.js (LTS version recommended)
* npm 
* MongoDB (local or Atlas) — if using another database, update the data layer accordingly.

---

## 🔑 Environment Variables (example)

Create a `.env` file in the backend root directory with the following values:

```
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/manager_dashboard?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
SendGrid=your_secret_key_here
```

Modify variable names and values as needed.

---

## 🚀 Installation & Run Instructions

1. **Clone the repository:**

```bash
git clone https://github.com/VitorPio7/Manager_dashboard.git
cd Manager_dashboard/backend
```

2. **Install dependencies:**

```bash
npm install

```

3. **Set up your `.env` file** (see the previous section)

4. **Run in development mode:**

```bash
npm run dev
# or
node index.js
# or
npm start
```

---

## ✅ Best Practices

* Validate input using `express-validator` or similar.
* Implement centralized error handling middleware.
* Use `helmet`, `cors`, and a rate limiter in production.
* Keep a clean separation of concerns (controllers, services, repositories).

---

## 📄 License

You may include an open-source license such as **MIT**. If not already included, consider adding a `LICENSE` file to the repository.

---

## 📬 Contact

For questions or suggestions, please open an issue in the repository.

