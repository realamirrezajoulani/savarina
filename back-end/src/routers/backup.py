import datetime
import hashlib
import hmac
import io
import zipfile
import psycopg2
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
import orjson
from os import getenv

from database import POSTGRESQL_URL
from dependencies import require_roles
from utilities.enumerables import AdminRole
from utilities.authentication import oauth2_scheme


router = APIRouter()

__BACKUP_SECRET_KEY = getenv("CRMS_BACKUP_SECRET_KEY")

@router.get("/backup/")
def backup(
    *,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
):
    timestamp = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat() + "Z"

    conn = psycopg2.connect("postgres"+POSTGRESQL_URL[18:])
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
    """)
    tables = [row[0] for row in cur.fetchall()]

    mem_file = io.BytesIO()
    with zipfile.ZipFile(mem_file, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for table in tables:
            cur.execute(f"SELECT * FROM {table};")
            cols = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            data = [dict(zip(cols, row)) for row in rows]
            zf.writestr(f"{table}.json", orjson.dumps(data, default=str))

        signature = hmac.new(
            __BACKUP_SECRET_KEY.encode(),
            timestamp.encode(),
            hashlib.sha512
        ).hexdigest()
        metadata = {"backup_time_utc": timestamp, "signature": signature}
        zf.writestr("metadata.json", orjson.dumps(metadata))

    cur.close()
    conn.close()
    mem_file.seek(0)

    filename = f"backup_{timestamp}.zip"
    return StreamingResponse(
        mem_file,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/restore/")
async def restore(
    *,
    _user: dict = Depends(
        require_roles(
            AdminRole.SUPER_ADMIN.value,
        )
    ),
    _token: str = Depends(oauth2_scheme),
    file: UploadFile = File(...)
):
    content = await file.read()
    mem_file = io.BytesIO(content)

    with zipfile.ZipFile(mem_file) as zf:
        if "metadata.json" not in zf.namelist():
            raise HTTPException(status_code=400, detail="Invalid backup file: metadata missing")

        raw_meta = zf.read("metadata.json")
        metadata = orjson.loads(raw_meta)
        timestamp = metadata.get("backup_time_utc")
        signature = metadata.get("signature")
        if not timestamp or not signature:
            raise HTTPException(status_code=400, detail="Invalid metadata format")

        expected_sig = hmac.new(
            __BACKUP_SECRET_KEY.encode(),
            timestamp.encode(),
            hashlib.sha512
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            raise HTTPException(status_code=400, detail="Backup file signature mismatch")

        # ۴. اتصال به دیتابیس و ری‌استور
        conn = psycopg2.connect("postgres"+POSTGRESQL_URL[18:])
        cur = conn.cursor()
        for name in zf.namelist():
            if name == "metadata.json":
                continue
            table = name.replace(".json", "")
            raw = zf.read(name)
            data = orjson.loads(raw)

            cur.execute(f"TRUNCATE TABLE {table} CASCADE;")
            for row in data:
                cols = list(row.keys())
                vals = [row[col] for col in cols]
                placeholders = ", ".join(["%s"] * len(cols))
                col_list = ", ".join(cols)
                cur.execute(
                    f"INSERT INTO {table} ({col_list}) VALUES ({placeholders});",
                    vals
                )

        conn.commit()
        cur.close()
        conn.close()

    return {"status": "restore completed", "restored_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat() + "Z"}
