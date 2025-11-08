default:
    @just --list

install-backend:
    cd backend && uv sync

run-backend:
    cd backend && PYTHONPATH=src uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port ${PORT:-8000}

test-backend:
    cd backend && uv run --with-editable . --with httpx python ../scripts/smoke_test.py ${BASE_URL:-http://localhost:8000}

