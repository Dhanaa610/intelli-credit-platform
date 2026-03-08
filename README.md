# IntelliCredit | AI-Powered Credit Decision Platform

This is the consolidated version of the IntelliCredit platform, ready for cloud deployment.

## Project Structure
- `backend/`: FastAPI server and AI logic modules.
- `frontend/`: The original HTML/JS/CSS dashboard prototype.
- `render.yaml`: Blueprint for automated deployment on Render.com.

## Deployment Instructions

### 1. Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Upload all files from this folder (`intelli-credit-upgraded`) to your new repository.

### 2. Deploy to Render
1. Log in to [Render.com](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and set up your 24/7 server!

## Local Development
If you want to run it locally:
1. Install dependencies: `pip install -r backend/requirements.txt`
2. Start the server: `python backend/main.py`
3. Access at: `http://localhost:8001`
