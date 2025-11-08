from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

app = FastAPI(title="Browser OS Backend")


class UserAction(BaseModel):
    action: str
    data: dict[str, str] | None = None


@app.post("/action", response_class=HTMLResponse)
async def handle_action(action: UserAction) -> str:
    if action.action == "open_file_explorer":
        return """
        <div style="width: 560px; height: 320px; padding: 12px;">
            <div>Empty</div>
        </div>
        """
    return "<div>Unknown action</div>"


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

