document.addEventListener("DOMContentLoaded", function () {
    checkWebsiteStatus();
    
    // Add event listener for any refresh button that gets added
    document.addEventListener('click', function(event) {
        if (event.target.closest('.refresh-btn')) {
            checkWebsiteStatus();
        }
    });
});

function checkWebsiteStatus() {
    // Reset to loading state
    document.getElementById("statusBox").innerHTML = `
        <div id="loader">
            <div class="spinner"></div>
            <span>Checking website status...</span>
        </div>
    `;
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const fullUrl = tabs[0].url;
        const domain = new URL(fullUrl).hostname;
        
        fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: domain })
        })
        .then(response => response.json())
        .then(data => {
            const statusColor = getStatusColor(data.status);
            const statusIcon = getStatusIcon(data.status);
            
            // Apply dynamic background color based on status
            const box = document.getElementById("statusBox");
            box.style.borderLeft = `4px solid ${getStatusColorCode(data.status)}`;
            
            box.innerHTML = `
                <div class="label">
                    <div class="icon"><i class="material-icons" style="color: #555;">link</i></div>
                    URL:
                </div>
                <div class="value">${data.url}</div>
                
                <div class="label">
                    <div class="icon"><i class="material-icons" style="color: ${getStatusColorCode(data.status)};">${statusIcon}</i></div>
                    Status:
                </div>
                <div class="status-container">
                    <span class="status-badge badge-${statusColor}"></span>
                    <div class="value ${statusColor} status-pulse">${data.status}</div>
                </div>
                
                <div class="label">
                    <div class="icon"><i class="material-icons" style="color: #555;">code</i></div>
                    HTTP Code:
                </div>
                <div class="value">${data.http_code ?? 'N/A'}</div>
                
                <div class="label">
                    <div class="icon"><i class="material-icons" style="color: #555;">timer</i></div>
                    Response Time:
                </div>
                <div class="value">${formatResponseTime(data.response_time)}</div>
                
                ${data.error ? `
                    <div class="label">
                        <div class="icon"><i class="material-icons" style="color: #e74c3c;">error</i></div>
                        Error:
                    </div>
                    <div class="value down">${data.error}</div>
                ` : ''}
                
                <button class="refresh-btn">
                    <i class="material-icons" style="font-size: 14px;">refresh</i>
                    Refresh Status
                </button>
            `;
        })
        .catch(err => {
            document.getElementById("statusBox").innerHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <i class="material-icons" style="color: #e74c3c; font-size: 40px;">error_outline</i>
                </div>
                <div class="value down" style="text-align: center;">Could not connect to backend.<br>${err.message}</div>
                
                <button class="refresh-btn" style="margin: 15px auto 0; display: flex;">
                    <i class="material-icons" style="font-size: 14px;">refresh</i>
                    Retry Connection
                </button>
            `;
        });
    });
}

function getStatusColor(status) {
    if (status === "Up") return "up";
    if (status === "Down") return "down";
    return "issue";
}

function getStatusColorCode(status) {
    if (status === "Up") return "#2ecc71";
    if (status === "Down") return "#e74c3c";
    return "#f39c12";
}

function getStatusIcon(status) {
    if (status === "Up") {
        return "check_circle";
    } else if (status === "Down") {
        return "cancel";
    } else {
        return "warning";
    }
}

function formatResponseTime(time) {
    if (!time) return 'N/A';
    
    // Format response time with proper units
    const responseTime = parseFloat(time);
    if (responseTime < 1000) {
        return `${responseTime.toFixed(0)} ms`;
    } else {
        return `${(responseTime / 1000).toFixed(2)} s`;
    }
}

function formatResponseTime(time) {
    if (!time) return 'N/A';
    
    // Format response time with proper units
    const responseTime = parseFloat(time);
    if (responseTime < 1000) {
        return `${responseTime.toFixed(0)} ms`;
    } else {
        return `${(responseTime / 1000).toFixed(2)} s`;
    }
}