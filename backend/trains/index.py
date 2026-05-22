"""API для управления рейсами: создание, получение, обновление поездов и их объявлений."""
import json
import os
import psycopg2
from datetime import datetime

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
    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}

    # GET / — список всех рейсов
    if method == "GET" and "announcements" not in path:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT id, train_number, direction, type, departure_time, arrival_time,
                platform, wagons, status, notes, created_at
                FROM {SCHEMA}.trains ORDER BY COALESCE(departure_time, arrival_time) ASC"""
        )
        cols = [d[0] for d in cur.description]
        rows = []
        for row in cur.fetchall():
            r = dict(zip(cols, row))
            for k in ("departure_time", "arrival_time", "created_at"):
                if r.get(k):
                    r[k] = r[k].isoformat()
            rows.append(r)
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(rows, ensure_ascii=False)}

    # GET /trains/announcements?train_id=X — объявления рейса
    if method == "GET" and "announcements" in path:
        train_id = params.get("train_id")
        if not train_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "train_id required"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT ta.id, ta.train_id, ta.template_id, ta.text_rendered, ta.voice,
                ta.zone, ta.speed, ta.repeat_offsets, ta.is_active, ta.created_at,
                t.name as template_name
                FROM {SCHEMA}.train_announcements ta
                LEFT JOIN {SCHEMA}.announcement_templates t ON t.id = ta.template_id
                WHERE ta.train_id = %s ORDER BY ta.created_at ASC""",
            (train_id,)
        )
        cols = [d[0] for d in cur.description]
        rows = []
        for row in cur.fetchall():
            r = dict(zip(cols, row))
            if r.get("created_at"):
                r["created_at"] = r["created_at"].isoformat()
            rows.append(r)
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(rows, ensure_ascii=False)}

    # POST / — создать рейс
    if method == "POST" and "announcements" not in path:
        body = json.loads(event.get("body") or "{}")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.trains
                (train_number, direction, type, departure_time, arrival_time, platform, wagons, status, notes)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (
                body["train_number"],
                body["direction"],
                body.get("type", "departure"),
                body.get("departure_time") or None,
                body.get("arrival_time") or None,
                body.get("platform", ""),
                body.get("wagons", ""),
                body.get("status", "active"),
                body.get("notes", ""),
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id})}

    # PUT / — обновить рейс
    if method == "PUT" and "announcements" not in path:
        body = json.loads(event.get("body") or "{}")
        train_id = body.get("id")
        if not train_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""UPDATE {SCHEMA}.trains SET
                train_number=%s, direction=%s, type=%s,
                departure_time=%s, arrival_time=%s, platform=%s,
                wagons=%s, status=%s, notes=%s, updated_at=NOW()
                WHERE id=%s""",
            (
                body["train_number"], body["direction"], body.get("type", "departure"),
                body.get("departure_time") or None, body.get("arrival_time") or None,
                body.get("platform", ""), body.get("wagons", ""),
                body.get("status", "active"), body.get("notes", ""), train_id,
            )
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # POST /trains/announcements — прикрепить объявление к рейсу
    if method == "POST" and "announcements" in path:
        body = json.loads(event.get("body") or "{}")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.train_announcements
                (train_id, template_id, text_rendered, voice, zone, speed, repeat_offsets, is_active)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (
                body["train_id"],
                body.get("template_id"),
                body["text_rendered"],
                body.get("voice", "Алина"),
                body.get("zone", "Все зоны"),
                body.get("speed", 1.0),
                json.dumps(body.get("repeat_offsets", [30, 10, 5])),
                body.get("is_active", True),
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}