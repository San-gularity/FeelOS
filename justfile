default:
    @just --list

install-backend:
    cd backend && uv sync

run-backend:
    cd backend && PYTHONPATH=src uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port ${PORT:-8000}

