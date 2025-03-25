# SQULIO

## Opis projektu
SQULIO to internetowa gra przygodowa wspomagająca edukację wczesnoszkolną. Celem aplikacji jest angażowanie dzieci w naukę poprzez interaktywną rozgrywkę, system nagród oraz grywalizację. Użytkownik tworzy spersonalizowanego bohatera i wykonuje zadania edukacyjne, zdobywając nagrody i osiągnięcia.

## Technologie
Projekt wykorzystuje następujące technologie:
- **Frontend:** React.js, TypeScript
- **Backend:** Node.js, Express.js
- **Baza danych:** MongoDB
- **Serwer:** Linux Debian, Proxmox
- **Autoryzacja:** JWT (JSON Web Token)

## Funkcjonalności
- System logowania i rejestracji użytkowników
- Tworzenie oraz personalizacja postaci
- Codzienne wyzwania edukacyjne
- System nagród i osiągnięć
- Sklep z przedmiotami dla postaci
- Panel administracyjny do zarządzania treścią

## Instalacja
1. **Klonowanie repozytorium:**
   ```bash
   git clone [https://github.com/WojciechPestka/Aplikacja-Squlio.git]
   cd squlio
   ```
2. **Instalacja zależności:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Uruchomienie backendu:**
   ```bash
   cd backend
   npm start
   ```
4. **Uruchomienie frontendu:**
   ```bash
   cd frontend
   npm start
   ```

## Wdrożenie
Aplikacja działa na serwerze w kontenerze Proxmox. Wykorzystuje VPN (Tailscale) do bezpiecznego dostępu do bazy danych.
Aby uruchomić aplikację na serwerze:
```bash
cd /home/squlio/frontend && npm run build
cd /home/squlio/backend && pm2 start server.js -watch
```

## Pełna dokumentacja
Szczegółowa dokumentacja dotycząca działania aplikacji, jej architektury oraz wdrożenia znajduje się w pliku **SQULIO - dokumentacja.pdf**.


## Kontakt
W razie pytań prosimy o kontakt poprzez GitHub Issues.

