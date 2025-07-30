from db.mongodb import get_db
from models.test_log_model import TestLog

def get_test_logs(limit=50):
    db = get_db()
    logs = db["test_logs"].find().sort("timestamp", -1).limit(limit)
    return [TestLog(**log) for log in logs]

