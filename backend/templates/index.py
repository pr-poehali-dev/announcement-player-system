"""API для шаблонов объявлений: получение, создание, обновление."""
import json
import os
from decimal import Decimal
import psycopg2


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

SCHEMA = "t_p10033396_announcement_player_"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    # GET — все шаблоны
    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT id, name, category, text_template, variables, voice, zone, speed, is_system, created_at
                FROM {SCHEMA}.announcement_templates ORDER BY is_system DESC, name ASC"""
        )
        cols = [d[0] for d in cur.description]
        rows = []
        for row in cur.fetchall():
            r = dict(zip(cols, row))
            if r.get("created_at"):
                r["created_at"] = r["created_at"].isoformat()
            rows.append(r)
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(rows, ensure_ascii=False, cls=DecimalEncoder)}

    # POST — создать шаблон
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.announcement_templates
                (name, category, text_template, variables, voice, zone, speed, is_system)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (
                body["name"],
                body.get("category", "standard"),
                body["text_template"],
                json.dumps(body.get("variables", []), ensure_ascii=False),
                body.get("voice", "Алина"),
                body.get("zone", "Все зоны"),
                body.get("speed", 1.0),
                False,
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id})}

    # PUT — обновить шаблон
    if method == "PUT":
        body = json.loads(event.get("body") or "{}")
        tmpl_id = body.get("id")
        if not tmpl_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""UPDATE {SCHEMA}.announcement_templates SET
                name=%s, category=%s, text_template=%s, variables=%s,
                voice=%s, zone=%s, speed=%s WHERE id=%s AND is_system=FALSE""",
            (
                body["name"], body.get("category", "standard"), body["text_template"],
                json.dumps(body.get("variables", []), ensure_ascii=False),
                body.get("voice", "Алина"), body.get("zone", "Все зоны"),
                body.get("speed", 1.0), tmpl_id,
            )
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}