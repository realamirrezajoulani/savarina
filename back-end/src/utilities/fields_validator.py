from zoneinfo import ZoneInfo

from dateutil.relativedelta import relativedelta
from jdatetime import datetime
from fastapi import HTTPException


def validate_password_value(value: str) -> str | HTTPException:
    if len(value) < 16:
        raise HTTPException(status_code=400, detail="گذرواژه باید بیشتر از 16 کاراکتر داشته باشد")

    has_upper = has_lower = has_digit = has_special = False
    special_chars = set(r"!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~ ")

    for char in value:
        if not has_upper and char.isupper():
            has_upper = True
        elif not has_lower and char.islower():
            has_lower = True
        elif not has_digit and char.isdigit():
            has_digit = True
        elif not has_special and char in special_chars:
            has_special = True

        if has_upper and has_lower and has_digit and has_special:
            break

    if not has_upper:
        raise HTTPException(status_code=400, detail="گذرواژه باید شامل حداقل یک حرف کوچک انگلیسی باشد")
    if not has_lower:
        raise HTTPException(status_code=400, detail="گذرواژه باید شامل حداقل یک حرف بزرگ انگلیسی باشد")
    if not has_digit:
        raise HTTPException(status_code=400, detail="گذرواژه باید شامل حداقل یک عدد انگلیسی باشد")
    if not has_special:
        raise HTTPException(
            status_code=400,
            detail=r'گذرواژه باید شامل حداقل یک کاراکتر خاض باشد. کاراکتر های خاص !"#$%&''()*+,-./:;<=>?@[\\]^_`{|}~ '
        )

    return value


def validate_general_date(value: str) -> datetime | HTTPException:
    try:
        j_dt = datetime.strptime(value, "%Y/%m/%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="تاریخ باید به فرمت روز/ماه/سال باشد. مثال: 1380/05/01 و باید یک تاریخ معتبر باشد"
        )

    return j_dt.date()


def validate_birthday(value: str) -> str | HTTPException:
    j_dt: datetime = validate_general_date(value)

    if not (1310 <= j_dt.year <= datetime.now(ZoneInfo("Asia/Tehran")).year - 18):
        raise HTTPException(
            status_code=400,
            detail="کاربر باید حداقل 18 سال داشته باشد"
        )

    return str(value)


def validate_insurance_start_date(value: str) -> str | HTTPException:
    j_dt: datetime = validate_general_date(value)

    jd_tehran_now = datetime.now(ZoneInfo("Asia/Tehran"))
    gregorian_past = jd_tehran_now.togregorian() + relativedelta(years=-50)
    jd_tehran_past = datetime.fromgregorian(datetime=gregorian_past)

    if not (jd_tehran_past <= j_dt <= jd_tehran_now):
        raise HTTPException(
            status_code=400,
            detail=f"تاریخ شروع باید بین {jd_tehran_past.strftime("%Y/%m/%d")} و {jd_tehran_now.strftime("%Y/%m/%d")} باشد"
        )

    return str(value)


def validate_insurance_expiration_date(value: str) -> str | HTTPException:
    j_dt: datetime = validate_general_date(value)

    jd_tehran_now = datetime.now(ZoneInfo("Asia/Tehran"))
    gregorian_future = jd_tehran_now.togregorian() + relativedelta(years=+50)
    jd_tehran_future = datetime.fromgregorian(datetime=gregorian_future)

    if not (jd_tehran_now <= j_dt <= jd_tehran_future):
        raise HTTPException(
            status_code=400,
            detail=f"تاریخ انقضا باید بین {jd_tehran_now.strftime("%Y/%m/%d")} و {jd_tehran_future.strftime("%Y/%m/%d")} باشد"
        )

    return str(value)


def validate_rental_start_date(value: str) -> str | HTTPException:
    j_dt: datetime = validate_general_date(value)

    jd_tehran_now = datetime.now(ZoneInfo("Asia/Tehran"))
    gregorian_future = jd_tehran_now.togregorian() + relativedelta(months=+6)
    jd_tehran_future = datetime.fromgregorian(datetime=gregorian_future)

    if not (jd_tehran_now <= j_dt <= jd_tehran_future):
        raise HTTPException(
            status_code=400,
            detail=f"تاریخ شروع کرایه باید بین {jd_tehran_now.strftime("%Y/%m/%d")} و {jd_tehran_future.strftime("%Y/%m/%d")} باشد"
        )

    return str(value)


def validate_rental_end_date(value: str) -> str | HTTPException:
    j_dt: datetime = validate_general_date(value)

    jd_tehran_now = datetime.now(ZoneInfo("Asia/Tehran"))
    gregorian_future = jd_tehran_now.togregorian() + relativedelta(months=+12)
    jd_tehran_future = datetime.fromgregorian(datetime=gregorian_future)

    if not (jd_tehran_now <= j_dt <= jd_tehran_future):
        raise HTTPException(
            status_code=400,
            detail=f"تاریخ پایان کرایه باید بین {jd_tehran_now.strftime("%Y/%m/%d")} و {jd_tehran_future.strftime("%Y/%m/%d")} باشد"
        )

    return str(value)


def validate_payment_datetime(value: str) -> str | HTTPException:
    try:
        j_dt = datetime.strptime(value, "%Y/%m/%d %H:%M:%S")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="تاریخ و ساعت باید به فرمت ثانیه:دقیقه:ساعت روز/ماه/سال باشد."
                   " مثال 20:05:04 1380/01/05 و باید یک تاریخ و ساعت معتبر باشد"
        )

    jd_tehran_now = datetime.now(ZoneInfo("Asia/Tehran"))

    if not (j_dt <= jd_tehran_now):
        raise HTTPException(
            status_code=400,
            detail=f"تاریخ پرداخت مبلغ کرایه باید {jd_tehran_now.strftime("%Y/%m/%d")} یا عقب تر از این تاریخ باشد"
        )

    return str(value)
