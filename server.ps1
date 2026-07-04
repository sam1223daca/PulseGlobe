$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()
Write-Host "Server running at http://localhost:8000"
Start-Process "http://localhost:8000"

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $resp = $ctx.Response
    $path = $req.Url.LocalPath
    if ($path -eq '/') { $path = '/index.html' }
    $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
    if (Test-Path $filePath) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath)
        $mime = switch ($ext) {
            '.html' { 'text/html' }
            '.css'  { 'text/css' }
            '.js'   { 'application/javascript' }
            '.jpg'  { 'image/jpeg' }
            '.png'  { 'image/png' }
            '.json' { 'application/json' }
            '.svg'  { 'image/svg+xml' }
            '.md'   { 'text/markdown' }
            default { 'application/octet-stream' }
        }
        $resp.ContentType = $mime
        $resp.ContentLength64 = $bytes.Length
        $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $resp.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        $resp.OutputStream.Write($msg, 0, $msg.Length)
    }
    $resp.Close()
    Write-Host "$($req.HttpMethod) $($req.Url.LocalPath)"
}
