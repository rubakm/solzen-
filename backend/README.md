# Solzen Backend Mail Service (Gmail + Nodemailer)

This lightweight Node.js/Express service handles contact form inquiries for the Solzen website. It keeps your Gmail credentials secure on the server side and never exposes sensitive tokens to the frontend browser bundle.

---

## 1. Quick Setup

### Step A: Install Backend Dependencies
Open PowerShell or your preferred terminal:
```powershell
cd E:\dsa\backend
npm install
```

### Step B: Generate a Gmail App Password
1. Visit your [Google Account Security Settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned **ON**.
3. Under *2-Step Verification*, search for or click on **App passwords** (or visit: `https://myaccount.google.com/apppasswords`).
4. Enter an App name: `Solzen Website`.
5. Google will generate a **16-character password** (e.g., `abcd efgh ijkl mnop`).
6. Copy this password.

### Step C: Configure `backend/.env`
Open `E:\dsa\backend\.env` and paste your details:
```env
PORT=5000
GMAIL_USER=yourbusiness@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
CONTACT_RECEIVER=contact@solzen.in
FRONTEND_URL=http://localhost:5173
```

---

## 2. Running Locally

Start the backend in development mode (with auto-restart on changes):
```powershell
npm run dev
```

You should see:
```text
[SOLZEN Backend] Server running on http://localhost:5000
```

Now start your frontend in another terminal:
```powershell
cd E:\dsa
npm run dev
```

Submit the contact form on `http://localhost:5173/#contact`. The inquiry will immediately arrive in your Gmail inbox, formatted with Solzen's branded card styling!

---

## 3. Endpoints

- `GET /health` — Health check endpoint (used by hosting providers).
- `POST /api/contact` — Submits contact form inquiry:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@institution.edu",
    "subject": "Institutional Partnership",
    "message": "We would like to explore pedagogical collaboration."
  }
  ```

---

## 4. Production Deployment (Free Tier)

1. **Host Backend on Render.com, Railway, or Fly.io**:
   - Push your code to GitHub.
   - Create a new **Web Service** pointing to the `backend/` directory.
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Set Environment Variables:
     - `GMAIL_USER`
     - `GMAIL_APP_PASSWORD`
     - `CONTACT_RECEIVER`
     - `FRONTEND_URL` = `https://solzen-omega.vercel.app,https://solzen.in`
2. **Connect Frontend on Vercel**:
   - In Vercel Project Settings &rarr; **Environment Variables**:
   - Set `VITE_API_URL` = `https://your-backend-app.onrender.com`
   - Redeploy frontend.
