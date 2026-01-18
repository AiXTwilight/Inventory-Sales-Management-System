# Inventory & Sales Management System (Real-Time Stock Updates)

A full-stack **Inventory and Sales Management System** built using **FastAPI** and **PostgreSQL**, designed to manage products, sales, and real-time stock availability. Whenever a product is sold, the stock quantity is updated instantly—ensuring all users always see the latest inventory information.

---

## 📌 Table of Contents

* [Project Overview](#-project-overview)
* [Key Features](#-key-features)
* [Tech Stack](#-tech-stack)
* [System Architecture](#-system-architecture)
* [Folder Structure](#-folder-structure)
* [Running the Project](#-running-the-project)
* [Usage Guide](#-usage-guide)
* [Contributors](#-contributors)

---

## 🔍 Project Overview

Managing inventory manually often leads to inaccurate stock counts, mismatched sales records, and delayed updates. This project solves that problem by providing a centralized inventory system where:

✅ Products are stored with accurate quantity counts
✅ Sales instantly reduce stock quantity
✅ Stock levels remain consistent for all users
✅ Inventory and transactions remain traceable and organized

This system is suitable for:

* Retail shops
* Warehouses
* Small and medium businesses
* Any sales-driven stock management workflow

---

## ✨ Key Features

### ✅ Inventory Management

* Add new products with product details (name, price, quantity, category, etc.)
* Edit product details and update stock
* View inventory list with current stock status
* Delete products *(controlled access / admin logic if implemented)*

### ✅ Sales Management

* Create sales transactions
* Auto-deduct stock quantity after sale
* Maintain sales history / transaction records
* Prevent sales if stock is insufficient

### ✅ Real-Time Stock Updates

* Inventory quantity updates instantly after each sale
* Ensures accurate stock status across all users and sessions

### ✅ Clean Frontend Dashboard

* User-friendly UI for inventory browsing
* Quick product actions (add/edit/delete)
* Simple sales interface for fast billing flow *(based on implementation)*

---

## 🧰 Tech Stack

### Backend

* **FastAPI (Python)**
* **PostgreSQL**
* **Uvicorn**
* **ORM**

### Frontend

* **HTML**
* **CSS**
* **JavaScript**

---

## 🏗 System Architecture

**Application flow:**

1. Frontend sends request to backend
2. Backend validates input and performs database operations
3. When a sale is created:

   * Stock is validated
   * Sale record is created
   * Stock is deducted instantly
4. Updated inventory is returned to the frontend

**Core logic:**

> Sale Created → Validate Stock → Deduct Stock → Save Sale → Return Updated Inventory

---

## 📁 Folder Structure

```bash
Inventory-Sales-Management-System/
│
├── Backend/                # FastAPI backend + PostgreSQL integration
├── Frontend/               # Frontend UI (HTML, CSS, JS)
├── .vscode/                # VS Code configuration
├── .gitignore
└── README.md
```

---

## ▶️ Running the Project

### Run Backend (FastAPI)

From the backend directory, start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```

---

### Run Frontend

If frontend is built using plain HTML/CSS/JS:

* Open `Frontend/index.html` directly in browser
  OR
* Use Live Server in VS Code

---

## 🧑‍💻 Usage Guide

### ✅ Add Product

1. Go to inventory section
2. Enter product details
3. Save → product appears in inventory list

### ✅ Make Sale

1. Select product
2. Enter quantity
3. Confirm sale
4. Stock quantity updates instantly

### ✅ View Sales History

* Open sales/transactions section
* View all previous sales records

---

## 👥 Contributors

* **AiXTwilight** (Project Owner)
* **Mkxthetic**
