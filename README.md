# Ava backend

A tiny proxy server. It holds your Anthropic API key and forwards chat
requests to Claude, so the key never appears inside the app itself.

## Deploy (Railway or Render — easiest options)

1. Create a free account at railway.app or render.com.
2. Create a new "Web Service" and upload/connect this `backend` folder
   (or push it to a GitHub repo and connect that repo).
3. Set the build command to `npm install` and start command to `npm start`.
4. Add an environment variable:
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
5. Deploy. You'll get a public URL like `https://ava-backend.up.railway.app`.
6. Test it:
   ```
   curl -X POST https://ava-backend.up.railway.app/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"hello"}]}'
   ```

Once deployed, put that URL into the Android app's `MainActivity.kt`
(`BACKEND_URL` constant) before building the app.

## Notes

- The rate limiter (20 requests/minute/IP) is a basic abuse guard — tune
  it once you see real traffic.
- Conversation history is capped to the last 20 messages sent to the
  API to control cost.
- Consider adding a `/chat` request size cap and basic logging/alerts
  once live.
