from fastapi import FastAPI, Request
from starlette.middleware.gzip import GZipMiddleware

from database import lifespan
from routers import customer, admin, invoice, payment, rental, vehicle, vehicle_insurance, comment, post, authentication

description = """
A lightweight RESTful API for a CRMS application using FastAPI and SQLModel 🚀
"""


app = FastAPI(lifespan=lifespan,
              title="CRMS API",
              description=description,
              version="0.0.1",
              contact={
                  "name": "Amirreza Joulani",
                  "email": "realamirrezajoulani@gmail.com",
              },
              license_info={
                  "name": "MIT",
                  "url": "https://opensource.org/license/MIT",
              })

app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=4)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Expect-CT"] = "max-age=86400, enforce"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

app.include_router(authentication.router, tags=["authentication"])
app.include_router(customer.router, tags=["customers"])
app.include_router(vehicle.router, tags=["vehicles"])
app.include_router(vehicle_insurance.router, tags=["vehicle_insurances"])
app.include_router(invoice.router, tags=["invoices"])
app.include_router(rental.router, tags=["rentals"])
app.include_router(payment.router, tags=["payments"])
app.include_router(comment.router, tags=["comments"])
app.include_router(post.router, tags=["posts"])
app.include_router(admin.router, tags=["admins"])
