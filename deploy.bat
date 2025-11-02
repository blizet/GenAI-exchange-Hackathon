@echo off
echo 🚀 Deploying to Firebase Hosting...

echo 📦 Building frontend...
cd frontend
npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🚀 Deploying to Firebase...
cd ..
firebase deploy --only hosting

if errorlevel 1 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
) else (
    echo ✅ Deployment successful!
    echo 🌐 Your app is now live!
)

pause
