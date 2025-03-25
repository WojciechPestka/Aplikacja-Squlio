const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../emailservices/emailservice');
const User = require('../models/User'); 

const getClientIP = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip.includes(',')) ip = ip.split(',')[0]; 
    return ip.replace(/^::ffff:/, '');
};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za 15 minut.",
    handler: async (req, res) => {
        const email = req.body.email; 
        await logSuspiciousActivity(req, "Zbyt wiele nieudanych prób logowania", email);
        res.status(429).json({ message: "Zbyt wiele prób. Spróbuj ponownie później." });
    }
});

let blockedIPs = [];

function blockIP(ip) {
    if (!blockedIPs.includes(ip)) {
        blockedIPs.push(ip);
        console.log(`Zablokowano IP: ${ip}`);
    }
}

function unblockIP(ip) {
    blockedIPs = filteredIPs.filter(blockedIp => blockedIp !== ip);
    console.log(`Odblokowano IP: ${ip}`);
}

function isBlocked(req, res, next) {
    const ip = getClientIP(req);
    if (blockedIPs.includes(ip)) {
        console.log(`Zablokowane IP próbowało uzyskać dostęp: ${ip}`);
        return res.status(403).json({ message: "Twój adres IP został zablokowany." });
    }
    next();
}

async function logSuspiciousActivity(req, reason, email = null) {
    const ip = getClientIP(req);
    const logEntry = `${new Date().toISOString()} - IP: ${ip} - Powód: ${reason}\n`;

    // Zapis do pliku logów
    // fs.appendFile(logFilePath, logEntry, (err) => {
    //     if (err) console.error("Błąd zapisu logu:", err);
    // });

    console.warn("Podejrzana aktywność wykryta:", logEntry);
    notifyAdmin(req, ip, reason);

    if (email) {
        const user = await User.findOne({ email });
        if (user && user.email) {
            notifyUser(user.email, ip, reason);
        }
    }

    if (reason !== "Zbyt wiele nieudanych prób logowania") {
        blockIP(ip);
    }
}

function detectInjection(req, res, next) {
    const dangerousPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|')\b|--|;)/i;
    
    for (const key in req.body) {
        if (typeof req.body[key] === 'string' && dangerousPatterns.test(req.body[key])) {
            logSuspiciousActivity(req, "Podejrzenie SQL/NoSQL Injection");
            return res.status(400).json({ message: "Nieprawidłowe dane wejściowe." });
        }
    }
    
    next();
}

function notifyAdmin(req, ip, reason) {
    const email = "wojciechpestka0@gmail.com";
    const headers = JSON.stringify(req.headers, null, 2);
    const connectionInfo = {
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
        localAddress: req.connection.localAddress,
        localPort: req.connection.localPort
    };
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers['referer'] || 'Unknown';
    const forwardedFor = req.headers['x-forwarded-for'] || 'Unknown';
    const host = req.headers['host'] || 'Unknown';

    const emailContent = `
        Wykryto podejrzaną aktywność!
        IP: ${ip}
        Powód: ${reason}
        User-Agent: ${userAgent}
        Referer: ${referer}
        Forwarded-For: ${forwardedFor}
        Host: ${host}
        Headers: ${headers}
        Connection Info: ${JSON.stringify(connectionInfo, null, 2)}
    `;

    sendEmail(email, 'ALERT: Podejrzana aktywność', emailContent);
    console.log("Wykryto podejrzaną aktywność i wysłano email do admina");
}

function notifyUser(email, ip, reason) {
    sendEmail(email, 'ALERT: Podejrzana aktywność na Twoim koncie', `Wykryto podejrzaną aktywność na Twoim koncie!\nIP: ${ip}\nPowód: ${reason}`);
    console.log(`Wykryto podejrzaną aktywność i wysłano email do użytkownika: ${email}`);
}

module.exports = { loginLimiter, detectInjection, blockIP, unblockIP, isBlocked };
