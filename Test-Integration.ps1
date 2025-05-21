# Test-Integration.ps1
# PowerShell script to test the prediction API integration

Write-Host "Testing AI Size Prediction Integration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Test parameters
$testParams = @{
    weight = 70
    age = 30
    height = 175
}

Write-Host "Test data:" -ForegroundColor Yellow
Write-Host "  Weight: $($testParams.weight) kg"
Write-Host "  Age: $($testParams.age) years"
Write-Host "  Height: $($testParams.height) cm"
Write-Host ""

# Function to test an endpoint
function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "Testing $Name..." -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = 'POST'
            ContentType = 'application/json'
            Body = ($testParams | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✓ Success!" -ForegroundColor Green
        Write-Host "  Predicted size: $($response.predicted_size)" -ForegroundColor Green
        
        if ($response.predicted_numeric) {
            Write-Host "  Raw numeric value: $($response.predicted_numeric)" -ForegroundColor Green
        }
        
        return $response
    }
    catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        return $null
    }
}

# Test both endpoints
Write-Host "1. Testing Next.js API" -ForegroundColor Cyan
$nextResult = Test-Endpoint -Name "Next.js API" -Url "http://localhost:3000/api/prediction"

Write-Host "`n2. Testing Flask API" -ForegroundColor Cyan
$flaskResult = Test-Endpoint -Name "Flask API" -Url "http://localhost:5000/api/predict"

Write-Host "`nTest Summary" -ForegroundColor Cyan
Write-Host "===========" -ForegroundColor Cyan

if ($nextResult) {
    Write-Host "✓ Next.js API: Success" -ForegroundColor Green
} else {
    Write-Host "✗ Next.js API: Failed" -ForegroundColor Red
}

if ($flaskResult) {
    Write-Host "✓ Flask API: Success" -ForegroundColor Green
} else {
    Write-Host "✗ Flask API: Failed" -ForegroundColor Red
}

if ($nextResult -and $flaskResult) {
    if ($nextResult.predicted_size -eq $flaskResult.predicted_size) {
        Write-Host "`n✓ Integration Successful! Both APIs return the same prediction." -ForegroundColor Green
    } else {
        Write-Host "`n✗ Integration Warning: APIs return different predictions." -ForegroundColor Yellow
        Write-Host "  Next.js API: $($nextResult.predicted_size)" -ForegroundColor Yellow
        Write-Host "  Flask API: $($flaskResult.predicted_size)" -ForegroundColor Yellow
    }
}
