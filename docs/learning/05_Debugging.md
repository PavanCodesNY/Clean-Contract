# 05 - Debugging Checklist

Frontend side
- Is the UI calling `/api/*`?
- Check browser Network tab.

Proxy side
- Does `app/api/*/route.ts` return an error?
- Check response body for details.

Backend side
- Is FastAPI running?
- Does `/health` return OK?
- Check logs for stack traces.

Env side
- Are required keys set in `.env.local`?
- Is `PYTHON_BACKEND_URL` correct?
