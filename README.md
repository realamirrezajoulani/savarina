# CRMS (Car Rental Management System)

![Alt text](https://s33.picofile.com/file/8483803550/Savarina_1_page_0001.jpg)

A fully electronic, end-to-end car rental platform that streamlines both online and in-person bookings. Built with FastAPI, SQLModel/SQLAlchemy, and PostgreSQL on the backend, and a React single-page application on the frontend, the system empowers three user roles:


Customers browse vehicles, reserve online or in person, and choose delivery or pickup.<br>
Admins manage fleet inventory, oversee bookings, and coordinate delivery agents.<br>
Super Admins configure global settings, manage all users/admins, and monitor system analytics.<br>


### Live API Docs: https://crms-ddmm.onrender.com/docs/

# Key Features
## Backend
FastAPI-powered REST API with automatic Swagger & ReDoc docs<br>
Data models via SQLModel (SQLAlchemy) and PostgreSQL storage
#### Authentication & RBAC
JWT logins for three roles<br>
OAuth2 password flow support<br>
Division Management to Access and Determine Access for all roles
#### Vehicle & Booking Management
CRUD for all endpoints<br>
Multi-step reservation: select → payment intent → confirm<br>
Online booking + in-person pickup combinations<br>
Costume for Iranian and Persian-speaking users
#### Validation & Security
Pydantic input validation<br>
Environment-driven secrets and configurable settings




