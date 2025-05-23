from fastapi import FastAPI, Request
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from database import lifespan
from routers import backup, customer, admin, invoice, payment, rental, vehicle, vehicle_insurance, comment, post, \
    authentication, api_status, stats

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
              },
              default_response_class=ORJSONResponse)

app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=4)


origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://localhost:5173",
    "https://localhost:5173",
    "https://savarina.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "OPTIONS", "HEAD", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "accept", "Authorization", "Authorization-Refresh"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Expect-CT"] = "max-age=86400, enforce"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Frame-Options"] = "DENY"
    return response


app.include_router(api_status.router, tags=["api status"])
app.include_router(backup.router, tags=["backup"])
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
app.include_router(stats.router, tags=["stats"])

