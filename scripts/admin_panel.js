document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.admin-section');
    const sectionTitle = document.getElementById('section-title');

    const sectionTitles = {
        'dashboard': 'Dashboard',
        'users': 'Gerenciamento de Usuários',
        'content': 'Gerenciamento de Crises',
        'security': 'Segurança',
        'logs': 'Logs do Sistema',
        'settings': 'Configurações'
    };

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            navLinks.forEach(nl => nl.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            sectionTitle.textContent = sectionTitles[targetSection];
        });
    });

    setInterval(function() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        const logsContainer = document.querySelector('.logs-container');
        if (Math.random() > 0.95) {
            const logTypes = ['info', 'success', 'warning', 'error'];
            const messages = [
                'Novo usuário acessou o sistema',
                'CTF completado com sucesso',
                'Tentativa de acesso suspeita detectada',
                'Backup automático realizado'
            ];
            
            const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            const newLog = document.createElement('div');
            newLog.className = `log-entry log-${randomType}`;
            newLog.textContent = `[${now.toISOString().slice(0, 19).replace('T', ' ')}] ${randomType.toUpperCase()}: ${randomMessage}`;
            
            logsContainer.insertBefore(newLog, logsContainer.firstChild);
            
            const logEntries = logsContainer.querySelectorAll('.log-entry');
            if (logEntries.length > 20) {
                logEntries[logEntries.length - 1].remove();
            }
        }
    }, 1000);
});

function checkSpecialLogin() {
    const username = document.getElementById('special-username').value;
    const password = document.getElementById('special-password').value;
    
    if (username === 'BobbySinger' && password === 'SenhaMuitoForte') {
        alert('Login realizado com sucesso!');
        window.location.href = 'pagina_secreta.html';
    } else {
        alert('Usuário ou senha incorretos!');
        document.getElementById('special-username').value = '';
        document.getElementById('special-password').value = '';
    }
}