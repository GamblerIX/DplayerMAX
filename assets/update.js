(function() {
    'use strict';
    
    // 获取更新按钮
    var updateBtn = document.getElementById('dplayermax-update-btn');
    var statusSpan = document.getElementById('dplayermax-update-status');
    
    if (!updateBtn) {
        return;
    }
    
    // 更新按钮点击事件
    updateBtn.addEventListener('click', function() {
        if (confirm('确定要更新插件吗？更新过程中请勿关闭页面。')) {
            performUpdate();
        }
    });
    
    /**
     * 执行更新
     */
    function performUpdate() {
        // 禁用按钮
        updateBtn.disabled = true;
        updateBtn.textContent = '正在更新...';
        setStatus('正在执行更新，请稍候...', 'info');
        
        // 发送AJAX请求
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/dplayermax/update?do=update&action=perform', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    
                    if (response.success) {
                        setStatus(response.message, 'success');
                        updateBtn.textContent = '更新成功';
                        
                        // 3秒后刷新页面
                        setTimeout(function() {
                            window.location.reload();
                        }, 3000);
                    } else {
                        setStatus(response.message + (response.error ? ' (' + response.error + ')' : ''), 'error');
                        updateBtn.disabled = false;
                        updateBtn.textContent = '重试更新';
                    }
                } catch (e) {
                    setStatus('解析响应失败', 'error');
                    updateBtn.disabled = false;
                    updateBtn.textContent = '重试更新';
                }
            } else {
                setStatus('请求失败，HTTP状态码: ' + xhr.status, 'error');
                updateBtn.disabled = false;
                updateBtn.textContent = '重试更新';
            }
        };
        
        xhr.onerror = function() {
            setStatus('网络错误，请检查网络连接', 'error');
            updateBtn.disabled = false;
            updateBtn.textContent = '重试更新';
        };
        
        xhr.send();
    }
    
    /**
     * 设置状态信息
     */
    function setStatus(message, type) {
        if (!statusSpan) {
            return;
        }
        
        var colors = {
            'info': '#5bc0de',
            'success': '#5cb85c',
            'error': '#d9534f'
        };
        
        statusSpan.textContent = message;
        statusSpan.style.color = colors[type] || '#333';
    }
})();
