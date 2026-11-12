from app import analyzer


class FakeCursor:
    def __init__(self, row=None):
        self.row = row

    def fetchone(self):
        return self.row


class FakeTransaction:
    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False


class FakeConnection:
    def __init__(self):
        self.commands = []

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def transaction(self):
        return FakeTransaction()

    def execute(self, statement, parameters=None):
        self.commands.append((statement, parameters))
        if statement.startswith("EXPLAIN"):
            return FakeCursor(([{"Plan": {"Node Type": "Result"}}],))
        return FakeCursor()


def test_explain_runs_in_readonly_transaction_with_timeout(monkeypatch):
    connection = FakeConnection()
    monkeypatch.setattr(analyzer, "connect", lambda: connection)

    result = analyzer.explain_query("SELECT 1")

    assert result == [{"Plan": {"Node Type": "Result"}}]
    assert connection.commands[0] == ("SET TRANSACTION READ ONLY", None)
    assert connection.commands[1][1] == ("10000ms",)
    assert connection.commands[2][0].startswith(
        "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT 1"
    )

