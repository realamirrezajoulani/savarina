import enum
from enum import Enum


class Gender(str, Enum):
    MALE = "مرد"
    FEMALE = "زن"
    OTHERS = "سایر"


class Brand(str, Enum):
    TOYOTA = "تویوتا"
    FORD = "فورد"
    HONDA = "هوندا"
    BMW = "بی ام و"
    MERCEDES_BENZ = "مرسدس بنز"
    AUDI = "آودی"
    CHEVROLET = "شورلت"
    NISSAN = "نیسان"
    VOLKSWAGEN = "فولکس‌واگن"
    HYUNDAI = "هیوندای"
    KIA = "کیا"
    SUBARU = "سابارو"
    MAZDA = "مازدا"
    VOLVO = "ولوا"
    LAND_ROVER = "لند روور"
    JEEP = "جیپ"
    PORSCHE = "پورشه"
    FIAT = "فيات"
    LEXUS = "لکسوس"
    DODGE = "دوج"
    ACURA = "اکورا"
    INFINITI = "اینفینیتی"
    GMC = "جی ام سی"
    SMART = "اسمارت"
    MINI = "منی"
    RENAULT = "رنو"
    PEUGEOT = "پوژو"
    CITROEN = "سیتروئن"
    SEAT = "سئات"
    SKODA = "اسکودا"
    MASERATI = "مازراتی"
    FERRARI = "فراری"
    LAMBORGHINI = "لامبورگینی"
    BUGATTI = "بوگاتی"
    TESLA = "تسلا"
    SUZUKI = "سوزوکی"
    OPEL = "اوپل"
    MITSUBISHI = "میتسوبیشی"
    ISUZU = "ایزوزو"
    DAEWOO = "دایو"
    MG = "ام‌جی"
    GREAT_WALL = "گریت وال"
    BYD = "بی‌وای‌دی"
    CHERY = "چری"
    GEELY = "جیلی"
    FISKER = "فیسکِر"
    ROLLS_ROYCE = "رولز رویس"
    BENTLEY = "بنتلی"
    ASTON_MARTIN = "استون مارتین"
    ALFA_ROMEO = "آلفا رومئو"
    LADA = "لادا"
    DAIHATSU = "دایهاتسو"
    CHRYSLER = "کریسلر"
    PONTIAC = "پانتیاک"
    SCION = "سیان"


class CarStatus(str, Enum):
    NEW = "نو"
    AVAILABLE = "موجود"
    RENTED = "اجاره شده"
    MAINTENANCE = "در سرویس"
    DAMAGED = "آسیب‌دیده"
    UNKNOWN = "نامشخص"


class InsuranceType(str, Enum):
    ThirdParty = "شخص ثالث"
    PassengerAccident = "حوادث سرنشین"
    VehicleBody = "بدنه خودرو"


class BranchLocations(str, Enum):
    TEHRAN = "تهران"
    MASHHAD = "مشهد"
    ISFAHAN = "اصفهان"
    SHIRAZ = "شیراز"
    TABRIZ = "تبریز"
    KISH = "کیش"
    QOM = "قم"
    AHVAZ = "اهواز"
    RASHT = "رشت"
    KERMAN = "کرمان"
    HAMEDAN = "همدان"
    YAZD = "یزد"
    URMIA = "ارومیه"
    BANDARABBAS = "بندرعباس"
    BUSHEHR = "بوشهر"


class PaymentMethod(str, Enum):
    CARD_TO_CARD = "انتقال وجه کارت به کارت"
    SATNA = "انتقال وجه ساتنا"
    PAYA = "انتقال وجه پایا"
    ONLINE_PAYMENT = "پرداخت اینترنتی"
    OTHER = "سایر"


class PaymentStatus(str, Enum):
    CREATED = "ایجاد شده"
    PENDING = "در انتظار تایید"
    COMPLETED = "تایید شده"
    FAILED = "ناموفق"
    CANCELED = "لغو شده"
    REFUNDED = "بازگشت مبلغ پرداختی"
    PARTIALLY_REFUNDED = "بازگشت بخشی از مبلغ پرداختی"
    EXPIRED = "منقضی شده"


class AdminRole(str, Enum):
    SUPER_ADMIN = "SuperAdmin"
    GENERAL_ADMIN = "Admin"
    # FLEET_ADMIN = "FleetAdmin"
    # FINANCIAL_ADMIN = "FinancialAdmin"
    # RESERVATION_ADMIN = "ReservationAdmin"


class CustomerRole(str, Enum):
    CUSTOMER = "Customer"


class AdminStatus(str, Enum):
    ACTIVE = "فعال"
    INACTIVE = "غیر فعال"


class InvoiceStatus(str, Enum):
    CREATED = "ایجاد شده"
    PENDING = "در انتظار تایید"
    COMPLETED = "تایید شده"
    FAILED = "ناموفق"
    CANCELED = "لغو شده"
    EXPIRED = "منقضی شده"


class LogicalOperator(str, Enum):
    AND = "and"
    OR = "or"
    NOT = "not"


class CommentSubject(str, Enum):
    BUG = "گزارش مشکل"
    FEATURE_REQUEST = "درخواست ویژگی جدید"
    QUESTION = "سوال"
    FEEDBACK = "بازخورد"
    SUGGESTION = "پیشنهاد"
    CRITICISM = "انتقاد"


class CommentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SPAM = "spam"
