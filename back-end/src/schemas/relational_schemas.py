from schemas.admin import AdminPublic
from schemas.comment import CommentPublic
from schemas.customer import CustomerPublic
from schemas.invoice import InvoicePublic
from schemas.payment import PaymentPublic
from schemas.post import PostPublic
from schemas.rental import RentalPublic
from schemas.vehicle import VehiclePublic
from schemas.vehicle_insurance import VehicleInsurancePublic


class RelationalVehiclePublic(VehiclePublic):
    insurances: list[VehicleInsurancePublic] = []
    rentals: list[RentalPublic] = []

class RelationalVehicleInsurancePublic(VehicleInsurancePublic):
    vehicle: VehiclePublic

class RelationalCustomerPublic(CustomerPublic):
    rentals: list[RentalPublic] = []
    comments: list[CommentPublic] = []

class RelationalInvoicePublic(InvoicePublic):
    rentals: list[RentalPublic] = []
    payments: list[PaymentPublic] = []

class RelationalRentalPublic(RentalPublic):
    customer: CustomerPublic
    vehicle: VehiclePublic
    invoice: InvoicePublic

class RelationalPaymentPublic(PaymentPublic):
    invoice: InvoicePublic

class RelationalCommentPublic(CommentPublic):
    customer: CustomerPublic

class RelationalAdminPublic(AdminPublic):
    posts: list[PostPublic] = []

class RelationalPostPublic(PostPublic):
    admin: AdminPublic
