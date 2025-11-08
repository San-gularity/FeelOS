from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import marvin
from jinja2 import Template

app = FastAPI(title="FeverDreamOS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app_cache: dict[str, str] = {}

PROMPT_TEMPLATE = Template("""
generate html with inline css for a '{{ app_name }}' desktop app. windows xp style.

the content will be placed inside an existing window that ALREADY HAS a title bar and close button.
DO NOT generate any window chrome, title bars, or close buttons.
only generate the app's content area (toolbars, buttons, main content).

return pure html with inline styles, no markdown code blocks.
""")


class UserAction(BaseModel):
    action: str
    data: dict[str, str] | None = None


@app.post("/action", response_class=HTMLResponse)
async def handle_action(action: UserAction) -> str:
    app_name = action.data.get("app_name", "Unknown App") if action.data else "Unknown App"

    if app_name in app_cache:
        return app_cache[app_name]

    html = await marvin.cast_async(
        {"app_name": app_name, "action": action.action},
        target=str,
        instructions=PROMPT_TEMPLATE.render(app_name=app_name),
    )

    app_cache[app_name] = html
    return html


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

