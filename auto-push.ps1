# Auto-push script for development
# This will watch for file changes and automatically push to GitHub

Write-Host "Auto-push to GitHub enabled" -ForegroundColor Green
Write-Host "Watching for changes..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

$lastHash = ""

while ($true) {
    # Get current git status hash
    $status = git status --porcelain
    
    if ($status) {
        $currentHash = ($status | Out-String).GetHashCode()
        
        if ($currentHash -ne $lastHash) {
            Write-Host "Changes detected!" -ForegroundColor Cyan
            
            # Stage all changes
            git add .
            
            # Commit with timestamp
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git commit -m "Auto-commit: $timestamp"
            
            # Push to GitHub
            Write-Host "Pushing to GitHub..." -ForegroundColor Green
            git push origin main
            
            Write-Host "Pushed successfully!" -ForegroundColor Green
            Write-Host ""
            
            $lastHash = $currentHash
        }
    }
    
    # Wait 5 seconds before checking again
    Start-Sleep -Seconds 5
}
